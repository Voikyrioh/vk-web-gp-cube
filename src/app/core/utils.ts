/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

export async function initWebGPUContext(canvas: HTMLCanvasElement): Promise<{ canvas: GPUCanvasContext, device: GPUDevice }> {
    if (!navigator.gpu) {
        throw Error("WebGPU not supported.");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw Error("Couldn't request WebGPU adapter.");
    }

    const canvasContext = canvas.getContext('webgpu');
    if (!canvasContext) {
        throw new Error('This navigator is not supported!');
    }

    const device = await adapter.requestDevice();

    canvasContext.configure({
        device,
        format: "bgra8unorm"
    });

    return {
        canvas: canvasContext,
        device
    };
}
