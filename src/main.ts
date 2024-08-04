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

function setSliderStyle(slider: HTMLInputElement ) {
    const [value, min, max]: [number, number, number] = [Number(slider.value) ?? 0, Number(slider.min) ?? 0, Number(slider.max) ?? 0];
    const direction = value >= 0 ? 'right' : 'left';
    const absoluteRange = Math.abs(min) + Math.abs(max);
    const absoluteValue = (Math.abs(value) * Math.abs(min)) / absoluteRange + (Math.abs(value) * Math.abs(max)) / absoluteRange;
    const indicator = document.getElementById(`${slider.id}-out`) as HTMLOutputElement;
    indicator.innerHTML = `${value}<span></span>`;

    const color = (pos: 0|1) => `rgba(${absoluteValue / Math.abs(max) * 255}, 191, 255, ${pos})`;

    if (min > 0) {
        const percentile = absoluteValue * 96 / Math.abs(max) + 2;
        slider.style.background = `linear-gradient(to right, ${color(1)} 0%, ${color(1)} ${percentile}%, ${color(0)} ${percentile}%, ${color(0)} 100%)`;
        indicator.style.left = `${slider.offsetLeft + percentile * slider.offsetWidth /100  }px`;
    } else {
        const percentile = absoluteValue * 96 / Math.abs(max);
        const median = 1 - (Math.abs(min)/(Math.abs(max) + Math.abs(min)));
        const rangUpValue = percentile / 2 + median * 100;
        const rangDwnValue = median*100 - percentile/2;
        slider.style.background = `linear-gradient(to right, ${color( 0)} 0%, ${color( 0)} ${rangDwnValue}%, ${color(direction === "left" ? 1 : 0)} ${rangDwnValue}%, ${color( direction === "left" ? 1 : 0)} ${median*100}%, ${color( direction === "right" ? 1 : 0)} ${median*100}%, ${color(direction === "right" ? 1 : 0)} ${rangUpValue}%, ${color( 0)} ${rangUpValue}%, ${color(0)} 100%)`;
        indicator.style.left = `${slider.offsetLeft + slider.offsetWidth * median + (direction === "right" ? percentile : -percentile)/100 * slider.offsetWidth/2 }px`;
    }
}

function sliderStylization() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach((slider: Element) => {
        setSliderStyle(slider as HTMLInputElement);
        slider.addEventListener('input', () => {
            setSliderStyle(slider as HTMLInputElement);
        });
    });
}

startProgram().catch((error: Error) => {
    console.trace(error);
    console.error(error.message);
    window.addEventListener('load', () => {
        alert(`Impossible de lancer l'application, vérifiez que vous êtes bien sur une version du navigateur qui support web-GPU.`)
    })
})

window.addEventListener('load', () => {sliderStylization();})
