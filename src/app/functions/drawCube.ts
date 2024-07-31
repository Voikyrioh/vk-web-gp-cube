/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import shader from "../../shaders/basic.wgsl?raw"
import {Cube} from "../core/class/Cube.ts";
import Vector3 from "../core/class/Vector3.ts";

export default async function drawCube(device: GPUDevice, context: GPUCanvasContext/*, x: number, y: number*/): Promise<void> {
    return new Promise(resolve => {
        const sliderX = (document.getElementById('angle-x-slider') as HTMLInputElement);
        const sliderY = (document.getElementById('angle-y-slider') as HTMLInputElement);
        const sliderZ = (document.getElementById('angle-z-slider') as HTMLInputElement);
        const distanceSlider = (document.getElementById('distance-slider') as HTMLInputElement);

        const myCube = new Cube({
            angle: new Vector3(
                Number(sliderX.value ?? 0)/360*2*Math.PI,
                Number(sliderY.value ?? 0)/360*2*Math.PI,
                Number(sliderZ.value ?? 0)/360*2*Math.PI
            ),
            coordinates: new Vector3(0, 0, 1),
            distance: Number(distanceSlider?.value ?? 1),
            size: 50
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
                    arrayStride: 24,
                    attributes: [
                        {
                            shaderLocation: 0, offset: 0, format: "float32x3"
                        },
                        {
                            shaderLocation: 1, offset: 12, format: "float32x3"
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

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                loadOp: 'clear',
                clearValue: [33/255, 33/255, 33/255, 1],
                storeOp: 'store'
            }]
        });
        passEncoder.setPipeline(pipeline);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.draw( Cube.VertexesCount );
        passEncoder.end();

        const commandBuffer = commandEncoder.finish();
        device.queue.submit([commandBuffer]);
        resolve();
    });
}
