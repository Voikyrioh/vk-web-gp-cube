/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import shader from "../../shaders/basic.wgsl?raw";
import {Cube} from "../core/class/Cube.ts";
import Vector3 from "../core/class/Vector3.ts";
import {Slider} from "../../web/components";

export type NeccesarySliders = "sliderX" | "sliderY" | "sliderSize" | "sliderAngleX" | "sliderAngleY" | "sliderAngleZ";

async function loadImageBitmap(url: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    return createImageBitmap(blob, { colorSpaceConversion: 'none' });
}

export default async function drawCube(device: GPUDevice, context: GPUCanvasContext, sliders: Record<NeccesarySliders, Slider> ): Promise<void> {
    const textureData = await loadImageBitmap('/textures/textureDefault.png');
    const {sliderX, sliderY, sliderSize, sliderAngleX, sliderAngleY, sliderAngleZ} = sliders;

    return new Promise(resolve => {

        const texture = device.createTexture({
            label: '/textures/grass.png',
            size: [64, 48],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture(
            { source: textureData, flipY: false },
            { texture },
            { width: textureData.width, height: textureData.height },
        );

        const myCube = new Cube({
            angle: new Vector3(
                sliderAngleX.value/360*2*Math.PI,
               sliderAngleY.value/360*2*Math.PI,
               sliderAngleZ.value/360*2*Math.PI
            ),
            coordinates: new Vector3(sliderX.value, sliderY.value, 400),
            distance: 1,
            size: sliderSize?.value,
            texturePath: "textures/grassblockAllSides.jpg"
        });

        const vertexes = new Float32Array(myCube.toVertexes());
        const vertexBuffer = device.createBuffer({
            size: vertexes.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(vertexBuffer, 0, vertexes);


        const shaderModule = device.createShaderModule({
            code: shader
        })

        const pipeline = device.createRenderPipeline({
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
                }],
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

        const sampler = device.createSampler();

        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sampler },
                { binding: 1, resource: texture.createView() },
            ],
        });

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                loadOp: 'clear',
                clearValue: [33/255, 33/255, 33/255, 1],
                storeOp: 'store'
            }]
        });
        passEncoder.setViewport(0,0,800,600, 0,1)
        passEncoder.setPipeline(pipeline);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw( Cube.VertexesCount );
        passEncoder.end();

        const commandBuffer = commandEncoder.finish();

        device.queue.submit([commandBuffer]);
        resolve();
    });
}
