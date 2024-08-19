/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import {initWebGPUContext} from "../utils.ts";
import {Chunk} from "./Map.ts";
// @ts-ignore
import shader from "../../../shaders/basic.wgsl?raw";
import {Cube} from "./Cube.ts";
import {Slider} from "../../../web/components";
import Vector3 from "./Vector3.ts";
import {VecMatrix} from "./VecMatrix.ts";

interface MainProgramProperties {
    canvas: HTMLCanvasElement;
}

export class MainProgram {
    private _canvas!: GPUCanvasContext;
    private _device!: GPUDevice;
    private _pipeline!: GPURenderPipeline;
    private _bindGroup!: GPUBindGroup;
    private running: boolean = true;
    private map: Chunk;
    public GameInitStatus: Promise<boolean>;
    private _uniformBuffer!: GPUBuffer;
    private _uniformGroup!: GPUBindGroup;


    constructor(prop: MainProgramProperties) {
        this.map = new Chunk(new Vector3(0,-300,0));
        this.GameInitStatus = initWebGPUContext(prop.canvas).then(async ctx => {
            this._canvas = ctx.canvas;
            this._device = ctx.device;
            await this.initialize().catch(error => {
                throw Error(error)
            });
            return true;
        });
    }

    private async loadImageBitmap(url: string): Promise<ImageBitmap> {
        const res = await fetch(url);
        const blob = await res.blob();


        return createImageBitmap(blob, { colorSpaceConversion: 'none' });
    }

    private setupShaders(texture: GPUTexture) {
        const shaderModule = this._device.createShaderModule({
            code: shader
        })

        this._pipeline = this._device.createRenderPipeline({
            label: "cubes",
            layout: "auto",
            vertex: {
                module: shaderModule,
                entryPoint: 'vertmain',
                buffers: [{
                    arrayStride: 20,
                    attributes: [
                        {
                            shaderLocation: 0, offset: 0, format: "float32x3"
                        },
                        {
                            shaderLocation: 1, offset: 12, format: "float32x2"
                        }
                    ]
                },],
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fragMain',
                targets: [{ format: "bgra8unorm" }]
            },
            primitive: {
                topology: 'triangle-list'
            }
        });

        const sampler = this._device.createSampler();

        this._uniformBuffer = this._device.createBuffer({
            label: 'uniform',
            size: 12*4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const rotationMatrix = new Float32Array(VecMatrix.addVertexFloat32Padding(VecMatrix.getRotationMatrice(this.map.rotations, this.map.pos)));
        this._device.queue.writeBuffer(this._uniformBuffer, 0, rotationMatrix);

        this._uniformGroup = this._device.createBindGroup({
            label: 'Uniforms',
            layout: this._pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: {buffer: this._uniformBuffer} },
            ],
        });

        this._bindGroup = this._device.createBindGroup({
            label: 'textures',
            layout: this._pipeline.getBindGroupLayout(1),
            entries: [
                { binding: 0, resource: sampler },
                { binding: 1, resource: texture.createView() },
            ],
        });
    }

    private async loadtexture(): Promise<GPUTexture> {
        const textureData = await this.loadImageBitmap('/textures/grass.png');
        const texture = this._device.createTexture({
            label: '/textures/grass.png',
            size: [64, 48],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this._device.queue.copyExternalImageToTexture(
            { source: textureData, flipY: false },
            { texture },
            { width: textureData.width, height: textureData.height },
        );

        return texture
    }

    private async initialize(): Promise<void> {
        const texture = await this.loadtexture();
        this.setupShaders(texture);

        // MainLoop
        while (this.running) {
            await Promise.all([
                this.draw(),
                new Promise(resolve => setTimeout(resolve, 1000/120))
            ]);
        }
    }

    private async draw() {
        const chunk: number[][] = this.map.draw();
        const vertexes = new Float32Array(chunk.flat());
        const vertexBuffer = this._device.createBuffer({
            size: vertexes.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        this._device.queue.writeBuffer(vertexBuffer, 0, vertexes);

        const rotationMatrix = new Float32Array(VecMatrix.addVertexFloat32Padding(VecMatrix.getRotationMatrice(this.map.rotations, this.map.pos)));
        this._device.queue.writeBuffer(this._uniformBuffer, 0, rotationMatrix);

        const commandEncoder = this._device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: this._canvas.getCurrentTexture().createView(),
                loadOp: 'clear',
                clearValue: [33/255, 33/255, 33/255, 1],
                storeOp: 'store'
            }]
        });
        passEncoder.setViewport(0,0,800,600, 0,1)
        passEncoder.setPipeline(this._pipeline);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.setBindGroup(0, this._uniformGroup);
        passEncoder.setBindGroup(1, this._bindGroup);
        passEncoder.draw( chunk.length * Cube.VertexesCount );
        passEncoder.end();

        const commandBuffer = commandEncoder.finish();

        this._device.queue.submit([commandBuffer]);
    }

    public stopProgram() {
        this.running = false;
    }

    public attachControls(appSliders: Record<string, Slider>) {
        this.map.attachControls({
            posX: appSliders.sliderX,
            posY: appSliders.sliderY,
            rotateX: appSliders.sliderAngleX,
            rotateY: appSliders.sliderAngleY,
            rotateZ: appSliders.sliderAngleZ,
            distance: appSliders.sliderSize,
        })
    }
}
