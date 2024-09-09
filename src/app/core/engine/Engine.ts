import {EngineError, EngineErrorType} from "./errors/EngineError.ts";
import {Matrix4} from "./Maths/Matrix/Matrix4.ts";
import {get3DSpacePerspective, Scaling3DMatrix} from "./Maths/Functions/3DMatrixOperations.ts";
import {adaptatorHeight, adaptatorWidth} from "../../../constants/defaults.ts";
// @ts-ignore
import shader from '../../../shaders/basic.wgsl?raw';
import {Cube} from "./class/Cube.ts";
import {Chunk} from "./class/Chunk.ts";
import {Camera} from "./class/Camera.ts";
import {Vector3} from "./Maths/Vector/Vector3.ts";

export interface EngineContext {
    adapter: GPUAdapter;
    canvas: GPUCanvasContext;
    device: GPUDevice;
    pipeline: GPURenderPipeline;
    bindGroup: GPUBindGroup[];
    uniformBuffer: GPUBuffer[];
    uniformGroup: GPUBindGroup[];
}

export class Engine {
    protected engineContext!: EngineContext;
    public Ready = false;
    private map!: Chunk;
    private camera!: Camera;
    private distview: number = 1000;
    private fov: number = 90 * Math.PI  / 180;
    public fps = 0;
    private framerateHistory: number[] = [];

    constructor(canvasID: string) {
        const canvas: HTMLCanvasElement = document.getElementById(canvasID) as HTMLCanvasElement;

        Engine.CheckGPUCompatibility(canvas).then(({adapter, canvasContext}) => {
            Engine.CreateContext(canvasContext, adapter).then((context: EngineContext) => {
                this.map = new Chunk(new Vector3(0,0,0));
                this.camera = new Camera(this.fov, new Vector3(0,200,2000), context.canvas);
                this.engineContext = context;
                this.initEngine().catch(error => {
                    throw new Error(error)
                });
            });
        });
    }

    private setAppFPS(buffer: number[]) {
        this.fps = buffer.length -1;
    }

    protected async updateState(time: number) {
        await this.camera.move(time);
        const cubes: Cube[] = this.map.getChunkVertexes()
        const canvasTexture = this.engineContext.canvas.getCurrentTexture();
        const depthTexture = this.engineContext.device.createTexture({
            size: [canvasTexture.width, canvasTexture.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        const viewMatrix = new Matrix4(get3DSpacePerspective(this.camera.fov, adaptatorWidth/adaptatorHeight, 1, this.distview))
            .multiply(this.camera.getCameraMatrix())
            .multiply(Scaling3DMatrix(this.map.size));

        this.engineContext.device.queue.writeBuffer(this.engineContext.uniformBuffer[0], 0, new Float32Array(viewMatrix.toArray()));

        const commandEncoder = this.engineContext.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: this.engineContext.canvas.getCurrentTexture().createView(),
                loadOp: 'clear',
                clearValue: [33/255, 33/255, 33/255, 1],
                storeOp: 'store'
            }],
            depthStencilAttachment: {
                view: depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        });
        passEncoder.setViewport(0,0,adaptatorWidth,adaptatorHeight, 0,1);
        passEncoder.setPipeline(this.engineContext.pipeline);

        passEncoder.setBindGroup(0, this.engineContext.uniformGroup[0]);
        passEncoder.setBindGroup(1, this.engineContext.bindGroup[0]);

        cubes.forEach((cube, index) => {
            const vertexes = new Float32Array(cube.toVertexes());
            const vertexBuffer = this.engineContext.device.createBuffer({
                size: vertexes.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            });
            this.engineContext.device.queue.writeBuffer(vertexBuffer, 0, vertexes);
            passEncoder.setVertexBuffer(0, vertexBuffer);
            passEncoder.draw( Cube.VertexesCount );
        });
        passEncoder.end();
        const commandBuffer = commandEncoder.finish();
        this.engineContext.device.queue.submit([commandBuffer]);
    }


    protected async draw(time: number) {
        await this.camera.move(time);
        const cubes: Cube[] = this.map.getChunkVertexes()
        const viewMatrix = new Matrix4(get3DSpacePerspective(this.camera.fov, adaptatorWidth/adaptatorHeight, 1, this.distview))
            .multiply(this.camera.getCameraMatrix())
            .multiply(Scaling3DMatrix(this.map.size));
        this.engineContext.device.queue.writeBuffer(this.engineContext.uniformBuffer[0], 0, new Float32Array(viewMatrix.toArray()));

        const vertexes = new Float32Array(cubes.map(c => c.toVertexes()).flat());
        const vertexBuffer = this.engineContext.device.createBuffer({
            size: vertexes.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        this.engineContext.device.queue.writeBuffer(vertexBuffer, 0, vertexes);

        const commandEncoder = this.engineContext.device.createCommandEncoder();

        const canvasTexture = this.engineContext.canvas.getCurrentTexture();
        const depthTexture = this.engineContext.device.createTexture({
            size: [canvasTexture.width, canvasTexture.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: this.engineContext.canvas.getCurrentTexture().createView(),
                loadOp: 'clear',
                clearValue: [33/255, 33/255, 33/255, 1],
                storeOp: 'store'
            }],
            depthStencilAttachment: {
                view: depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        });
        passEncoder.setViewport(0,0,adaptatorWidth,adaptatorHeight, 0,1);
        passEncoder.setPipeline(this.engineContext.pipeline);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.setBindGroup(0, this.engineContext.uniformGroup[0]);
        passEncoder.setBindGroup(1, this.engineContext.bindGroup[0]);
        passEncoder.draw( cubes.length * Cube.VertexesCount );
        passEncoder.end();

        const commandBuffer = commandEncoder.finish();

        this.engineContext.device.queue.submit([commandBuffer]);
    }

    protected async mainLoop(t0: number): Promise<void> {
       requestAnimationFrame(async (t1: number) => {
            this.framerateHistory.push(t1 - t0);
            if (this.framerateHistory.reduce((a, b) => a + b, 0) >= 1000) {
               const buffer = this.framerateHistory;
               this.framerateHistory = [];
               this.setAppFPS(buffer);
            }
            await this.updateState(t1-t0);
            //await this.draw(t1-t0);
            this.mainLoop(t1)
        });
    }

    protected async initEngine() {
        const texture = await this.reloadTextures();
        await this.reloadShaders(texture);

        requestAnimationFrame(async (timestamp: number) => {
            await this.mainLoop(timestamp);
        });
    }

    protected loadGameFiles() {

    }

    protected loadGameScene() {

    }

    // @ts-ignore
    private generateGameScene() {

    }

    private async loadImageBitmap(url: string): Promise<ImageBitmap> {
        const res = await fetch(url);
        const blob = await res.blob();


        return createImageBitmap(blob, { colorSpaceConversion: 'none' });
    }

    protected async reloadTextures(): Promise<GPUTexture> {
        const textureData = await this.loadImageBitmap('/textures/grass.png');
        const texture = this.engineContext.device.createTexture({
            label: '/textures/grass.png',
            size: [64, 48],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.engineContext.device.queue.copyExternalImageToTexture(
            { source: textureData, flipY: false },
            { texture },
            { width: textureData.width, height: textureData.height },
        );

        return texture;
    }

    protected async reloadShaders(texture: GPUTexture): Promise<void> {
        const shaderModule = this.engineContext.device.createShaderModule({
            code: shader
        })

        this.engineContext.pipeline = this.engineContext.device.createRenderPipeline({
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
                cullMode: 'back'
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
        });

        const sampler = this.engineContext.device.createSampler();

        this.engineContext.uniformBuffer.push(this.engineContext.device.createBuffer({
            label: 'uniform',
            size: 16*4 + 4*4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        }));

        const viewMatrix = new Matrix4(get3DSpacePerspective(this.camera.fov, adaptatorWidth/adaptatorHeight, 1, this.distview))
            .multiply(this.camera.getCameraMatrix())
            .multiply(Scaling3DMatrix(this.map.size));
        this.engineContext.device.queue.writeBuffer(this.engineContext.uniformBuffer[0], 0, new Float32Array(viewMatrix.toArray()));

        this.engineContext.uniformGroup.push(this.engineContext.device.createBindGroup({
            label: 'Uniforms',
            layout: this.engineContext.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: {buffer: this.engineContext.uniformBuffer[0]} },
            ],
        }));

        this.engineContext.bindGroup.push(this.engineContext.device.createBindGroup({
            label: 'textures',
            layout: this.engineContext.pipeline.getBindGroupLayout(1),
            entries: [
                { binding: 0, resource: sampler },
                { binding: 1, resource: texture.createView() },
            ],
        }));
    }

    private static async CheckGPUCompatibility(canvas: HTMLCanvasElement, options?: GPURequestAdapterOptions): Promise<{adapter: GPUAdapter, canvasContext: GPUCanvasContext}> {
        if (!navigator.gpu) {
            throw new EngineError(EngineErrorType.WPGU_NOT_ACTIVATED);
        }

        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: "high-performance"
        });

        if (!adapter) {
            throw new EngineError(EngineErrorType.MINIMAL_CONFIGURATION);
        }

        const canvasContext = canvas.getContext('webgpu');

        if (!canvasContext) {
            throw new EngineError(EngineErrorType.NAVIGATOR_INCOMPATIBILITY);
        }

        return { adapter, canvasContext };
    }

    private static async CreateContext(canvas: GPUCanvasContext, adapter: GPUAdapter): Promise<EngineContext> {
        const contextBuffer: Partial<EngineContext> = {
            uniformGroup: [],
            uniformBuffer: [],
            bindGroup: []
        }

        const device = await adapter.requestDevice({
            label: "Cube"
        });

        canvas.configure({
            device,
            format: "bgra8unorm"
        });

        contextBuffer.adapter = adapter;
        contextBuffer.canvas = canvas;
        contextBuffer.device = device;

        return contextBuffer as EngineContext;
    }
}
