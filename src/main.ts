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
import {Modal} from "./web/components";

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
        const modal = new Modal({
            title: "Uh-oh !",
            content: "Impossible de lancer l'application, vérifiez que vous êtes bien sur une version du navigateur qui supporte web-GPU.",
            actions: [Modal.closeButton('Fermer')]
        });
        modal.open();
    })
})

async function changlogModal () {
    const release: {name: string, title: string, created_at: Date, body: string} = await fetch(`https://api.github.com/repos/Voikyrioh/vk-web-gp-cube/releases/latest`).then(body => body.json());
    const modal = new Modal({
        title: `Changelog version ${release.name}`,
        subtitle: new Date(release.created_at).toLocaleString(),
        content: release.body,
        actions: [Modal.closeButton('Fermer')]
});
    modal.open();
}

// @ts-ignore
window['changlogModal'] = changlogModal;

window.addEventListener('load', () => {
    setupWebsiteScript();
    (document.getElementById('app-version') as HTMLParagraphElement).innerHTML =`Version de l'application: <b>v${__APP_VERSION__}</b>`;
})
