/*
    Copyright (c) 2024, Yoann Pommier
    All rights reserved.

    This source code is licensed under the BSD-style license found in the
    LICENSE file in the root directory of this source tree.
 */

import './style.css';
import { Core } from './app';
import { Defaults } from './constants';
import drawCube, {NeccesarySliders} from "./app/functions/drawCube.ts";
import setupWebsiteScript from "./web/main.ts";
import {Modal, Slider} from "./web/components";

const appSliders: Record<NeccesarySliders, Slider> = {
    'sliderX': new Slider({
        defaultValue: 0,
        max: Defaults.adaptatorWidth / 2,
        min: Defaults.adaptatorWidth / 2 * -1,
        name: "X",
        step: 1,
        stopPoints: [0]
    }),
    'sliderY': new Slider({
        defaultValue: 0,
        max: Defaults.adaptatorHeight / 2,
        min: Defaults.adaptatorHeight / 2 * -1,
        name: "Y",
        step: 1,
        stopPoints: [0]
    }),
    'sliderSize': new Slider({
        defaultValue: Defaults.adaptatorWidth / 8,
        max: Defaults.adaptatorWidth / 2,
        min: 0,
        name: "Size",
        step: 1,
        stopPoints: [Defaults.adaptatorWidth / 8, Defaults.adaptatorWidth / 4, 300]
    }),
    'sliderAngleX': new Slider({
        defaultValue: 0,
        max: 180,
        min: -180,
        name: "Angle X",
        step: 1,
        stopPoints: [-180, -90, -45, 0, 45, 90, 180]
    }),
    'sliderAngleY': new Slider({
        defaultValue: 0,
        max: 180,
        min: -180,
        name: "Angle Y",
        step: 1,
        stopPoints: [-180, -90, -45, 0, 45, 90, 180]
    }),
    'sliderAngleZ': new Slider({
        defaultValue: 0,
        max: 180,
        min: -180,
        name: "Angle Z",
        step: 1,
        stopPoints: [-180, -90, -45, 0, 45, 90, 180]
    })
};

for (const slider in appSliders) {
    document.getElementById("app-options")!.appendChild((appSliders[slider as NeccesarySliders]).getBlockElement());
}

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
            await drawCube(gpuContext.device, gpuContext.canvas, appSliders)]) // DRAW FUNCTION #TODO: Rename
    } while (true)
}

async function changlogModal () {
    const release: {name: string, title: string, created_at: Date, body: string, tag_name: string} = await fetch(`https://api.github.com/repos/Voikyrioh/vk-web-gp-cube/releases/latest`).then(body => body.json());
    const modal = new Modal({
        title: `${release.name}`,
        subtitle: `${release.tag_name} - ${new Date(release.created_at).toLocaleString()}`,
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
    startProgram().catch((error: Error) => {
        console.trace(error);
        console.error(error.message);
        const modal = new Modal({
            title: "Uh-oh !",
            content: "Impossible de lancer l'application, vérifiez que vous êtes bien sur une version du navigateur qui supporte web-GPU.",
            actions: [Modal.closeButton('Fermer')]
        });
        modal.open();
    });
})
