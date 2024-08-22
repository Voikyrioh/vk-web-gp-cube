/*
    Copyright (c) 2024, Yoann Pommier
    All rights reserved.

    This source code is licensed under the BSD-style license found in the
    LICENSE file in the root directory of this source tree.
 */

import './style.css';
import setupWebsiteScript from "./web/main.ts";
import { Defaults } from './constants';
import { NeccesarySliders } from "./app/types";
import { Modal, Slider } from "./web/components";
import { MainProgram } from "./app/core/class/MainProgram.ts";


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

    const appSliders: Record<NeccesarySliders, Slider> = {
        'sliderX': new Slider({
            defaultValue: 0,
            max: Defaults.adaptatorWidth,
            min: Defaults.adaptatorWidth * -1,
            name: "X",
            step: 1,
            stopPoints: [0]
        }),
        'sliderY': new Slider({
            defaultValue: 0,
            max: Defaults.adaptatorHeight,
            min: Defaults.adaptatorHeight * -1,
            name: "Y",
            step: 1,
            stopPoints: [0]
        }),
        'sliderZ': new Slider({
            defaultValue: -400,
            max: 0,
            min: -1000,
            name: "Z",
            step: 1,
            stopPoints: [0]
        }),
        'sliderAngleX': new Slider({
            defaultValue: -45,
            max: 180,
            min: -180,
            name: "Angle X",
            step: 1,
            stopPoints: [-180, -90, -45, 0, 45, 90, 180]
        }),
        'sliderAngleY': new Slider({
            defaultValue: 45,
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
        }),
        'sliderSize': new Slider({
            defaultValue: 200,
            max: 400,
            min: 0,
            name: "Size",
            step: 5,
            stopPoints: [50, 100, 150, 200, 250, 300, 350]
        }),
        'sliderFOV': new Slider({
            defaultValue: 60,
            max: 120,
            min: 1,
            name: "FOV",
            step: 1,
            stopPoints: [60,90]
        }),
        'sliderDistance': new Slider({
            defaultValue: 200,
            max: 800,
            min: 1,
            name: "Distance",
            step: 10,
            stopPoints: [200,400,600]
        })
    };

    for (const slider in appSliders) {
        document.getElementById("app-options")!.appendChild((appSliders[slider as NeccesarySliders]).getBlockElement());
    }

    const program = new MainProgram({ canvas: canvasContext});
            program.attachControls(appSliders);

    updateFPSIndicator(program);
}

function updateFPSIndicator(program: MainProgram) {
    const fpsIndicator = document.querySelector("#fps-indicator>b");
    if(fpsIndicator) fpsIndicator.textContent = program.fps?.toString(10) ?? '';
    requestAnimationFrame(() => {updateFPSIndicator(program)})
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
