import {clamp, crossProduct} from "../../utils";

function setGlobalStyle(arrayStyle: {name: string; style: string}[] ) {
    document.getElementById("dynamic-style")!.setHTMLUnsafe(arrayStyle.map(({style}) => style).join('\n'))
}

function setSliderStyle(slider: HTMLInputElement, arrayStyle: {name: string; style: string}[]): {name: string; style: string}[] {
    const {value, min} = getSliderValues(slider);
    const indicator = document.getElementById(`${slider.id}-out`) as HTMLOutputElement;
    indicator.innerHTML = `${value}<span></span>`;
    let style;

    if (min >= 0) {
        style = getPositiveSliderStyle(slider);
    } else {
        style = getTwoWaySliderStyle(slider);
    }

    const idx = arrayStyle.findIndex(({ name }) => name === slider.id)
    if (idx >= 0) arrayStyle[idx].style = style
    else arrayStyle.push({name: slider.id, style})

    setGlobalStyle(arrayStyle);
    return arrayStyle;
}

function getSliderValues(slider: HTMLInputElement) {
    const [value, min, max]: [number, number, number] = [Number(slider.value) ?? 0, Number(slider.min) ?? 0, Number(slider.max) ?? 0];
    const absoluteRange = Math.abs(min) + Math.abs(max);
    const absoluteValue = (Math.abs(value) * Math.abs(min)) / absoluteRange + (Math.abs(value) * Math.abs(max)) / absoluteRange;
    const direction = value >= 0 ? 'right' : 'left';

    return {
        value, min, max, absoluteValue, direction,
        sliderRunnable: `#${slider.id}::-webkit-slider-runnable-track`,
        indicator: document.getElementById(`${slider.id}-out`)
    };
}

function getPositiveSliderStyle(slider: HTMLInputElement): string {
    const {absoluteValue, max, sliderRunnable, indicator} = getSliderValues(slider);

    const percentile = absoluteValue * 96 / Math.abs(max) + 2;
    const bgStyle = `linear-gradient(to right, rgba(var(--super-pink), 100%) 0%, rgba(var(--super-blue), 100%) ${percentile}%, rgba(var(--super-blue), 0%) ${percentile}%, rgba(var(--super-blue), 0%) 100%)`;
    indicator!.style.left = `${(slider.offsetLeft + crossProduct(clamp(percentile * slider.offsetWidth /100, 0, slider.offsetWidth - 30)+30, slider.offsetWidth, slider.offsetWidth -15)-15)}px`;

    return `${sliderRunnable} {
        background: ${bgStyle}   
    }`;
}

function getTwoWaySliderStyle(slider: HTMLInputElement): string {
    const {absoluteValue, min, max, sliderRunnable, indicator, direction} = getSliderValues(slider);

    const percentile = absoluteValue * 96 / Math.abs(max);
    const median = 1 - (Math.abs(min)/(Math.abs(max) + Math.abs(min)));
    const rangUpValue = percentile / 2 + median * 100;
    const rangDwnValue = median*100 - percentile/2;
    const bgStyle = `linear-gradient(to right, rgba(var(--super-blue), 0%) 0%, rgba(var(--super-pink), 0%) ${rangDwnValue}%, rgba(var(--super-pink), ${direction === 'right' ? 0 : 100}) ${rangDwnValue}%, rgba(var(--super-blue), ${direction === 'right' ? 0 : 100}%) ${median*100}%, rgba(var(--super-blue), ${direction === 'left' ? 0 : 100}%) ${median*100}%, rgba(var(--super-pink), ${direction === 'left' ? 0 : 100}%) ${rangUpValue}%, rgba(var(--super-blue), 0%) ${rangUpValue}%, rgba(var(--super-blue), 0%) 100%)`;
    indicator!.style.left = `${slider.offsetLeft + slider.offsetWidth * median + (direction === "right" ? percentile : -percentile)/100 * slider.offsetWidth/2 }px`;

    return `${sliderRunnable} {
        background: ${bgStyle}   
    }`;
}

export function sliderStylization() {
    let styleArray: {name: string; style: string}[] = [];
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach((slider: Element) => {
        styleArray = setSliderStyle(slider as HTMLInputElement, styleArray);
        slider.addEventListener('input', () => {
            styleArray = setSliderStyle(slider as HTMLInputElement, styleArray);
        });
    });
}
