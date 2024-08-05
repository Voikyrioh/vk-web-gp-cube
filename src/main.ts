/*
    Copyright (c) 2024, Yoann Pommier
    All rights reserved.

    This source code is licensed under the BSD-style license found in the
    LICENSE file in the root directory of this source tree.
 */

import './style.css';
import { Core } from './app';
import { Defaults } from './constants';
import drawCube from "./app/functions/drawCube.ts";
import setupWebsiteScript from "./web/main.ts";

async function startProgram() {
    const app = document.querySelector('#app-program');
    let canvasContext: HTMLCanvasElement = document.createElement('canvas');
    canvasContext.setAttribute('width', Defaults.adaptatorWidth.toString(10));
    canvasContext.setAttribute('height', Defaults.adaptatorHeight.toString(10));
    canvasContext.setAttribute('id', 'gpu-canvas');

    if(app) {
        canvasContext = app.appendChild(canvasContext);
    } else {
        throw new Error('Could not create canvas context!');
    }

    const gpuContext = await Core.initWebGPUContext(canvasContext);

    do {
        await Promise.all([
            new Promise(resolve => setTimeout(resolve, 1000/120)), // FORCE TO 60 FPS MAX
            await drawCube(gpuContext.device, gpuContext.canvas)]) // DRAW FUNCTION #TODO: Rename
    } while (true)
}

startProgram().catch((error: Error) => {
    console.trace(error);
    console.error(error.message);
    window.addEventListener('load', () => {
        alert(`Impossible de lancer l'application, vérifiez que vous êtes bien sur une version du navigateur qui support web-GPU.`)
    })
})

window.addEventListener('load', () => {setupWebsiteScript();})
