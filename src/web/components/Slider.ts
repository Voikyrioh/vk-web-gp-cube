interface SliderProperties {
    defaultValue: number;
    min: number;
    max: number;
    step: number;
    name: string;
    stopPoints?: number[];
}

export class Slider {
    private readonly sliderBlock: HTMLDivElement;
    private readonly sliderElement: HTMLInputElement;
    private readonly customStyleElem: HTMLStyleElement;
    id: string;
    value: number;
    name: string;

    constructor(props: SliderProperties) {
        this.name = props.name;
        this.value = props.defaultValue;
        const protoId = `${props.name.toLowerCase().replace(' ', '-')}-slider`

        const sliderSameIdCount = document.querySelectorAll(`[id^=${protoId}-]`).length + 1;
        this.id = `${protoId}-${sliderSameIdCount}`

        this.sliderElement = this.generateSlider(props);
        this.sliderBlock = document.createElement('div');
        this.sliderBlock.setAttribute('id', `sliderBlock-${this.id}`);
        this.sliderBlock.setAttribute('class', `slider-block`);

        this.sliderBlock.appendChild(this.generateLabel());
        this.sliderBlock.appendChild(this.sliderElement);
        this.sliderBlock.appendChild(this.generateOutput());

        this.customStyleElem = document.createElement('style');
        this.customStyleElem.setAttribute('id', `custom-style-${this.id}`);
        this.sliderBlock.appendChild(this.customStyleElem);

        if (props.stopPoints) {
            this.sliderBlock.appendChild(this.generateDatalist(props.stopPoints));
        }
        document.addEventListener('load', () => {
            this.setSliderStyle();
        }, true);
        this.sliderElement.addEventListener('input', () => {this.value = Number(this.sliderElement.value) ?? 0})
    }

    public getBlockElement(): HTMLDivElement {
        return this.sliderBlock;
    }

    public attach(callback: (val: number) => void) {
        return this.sliderElement.addEventListener('input', () => callback(this.value));
    }

    private generateLabel(): HTMLLabelElement {
        const label = document.createElement('label') as HTMLLabelElement;
        label.setAttribute('for', this.id);
        label.innerText = this.name;

        return label;
    }

    private generateSlider(props: SliderProperties): HTMLInputElement {
        const slider = document.createElement("input");
        slider.id = this.id;
        slider.type = "range";
        slider.min = props.min.toString();
        slider.max = props.max.toString();
        slider.step = props.step.toString();
        slider.value = props.defaultValue.toString();
        slider.name = props.name;
        slider.addEventListener('input', () => { this.setSliderStyle() })

        return slider;
    }

    private generateOutput(): HTMLOutputElement {
        const output = document.createElement("output");
        output.setAttribute("id", `output-${this.id}`);
        output.textContent = this.sliderElement.value;
        output.appendChild(document.createElement('span'));

        return output;
    }

    private generateDatalist(stopPoints: number[]): HTMLDataListElement {
        const dataList = document.createElement('datalist');
        dataList.setAttribute('id', `sliderDatalist-${this.id}`);
        stopPoints.map((point: number) => {
            const pt = document.createElement('option');
            pt.value = point.toString();
            return pt;
        }).forEach((opt: HTMLOptionElement) => {
            dataList.appendChild(opt);
        })
        this.sliderElement.setAttribute('list', `sliderDatalist-${this.id}`);
        return dataList;
    }

    private setSliderStyle() {
        const [value, min, max]: [number, number, number] = [Number(this.sliderElement.value) ?? 0, Number(this.sliderElement.min) ?? 0, Number(this.sliderElement.max) ?? 0];
        const ceil = min * -1 + max;
        const valuePercent = (value + min  * -1 ) / ceil;
        const thumbOffset = valuePercent * -28 + 14;
        const percentOffset =  thumbOffset / this.sliderElement.offsetWidth * 100
        const indicator = document.getElementById(`output-${this.id}`) as HTMLOutputElement;

        const finalPercent = valuePercent*100+percentOffset

        let bgStyle;

        if (min >= 0) {
            bgStyle = `linear-gradient(to right, rgb(var(--super-blue)) 0%, rgb(var(--super-pink)) ${finalPercent}%, transparent ${finalPercent}%, transparent 100%)`
        } else {
            const zeroPercentVal = Math.abs(min) / ceil * 100;
            const parametric = (1 - (Math.pow(valuePercent, 2) / (2 * (Math.pow(valuePercent, 2) - valuePercent) + 1)));
            bgStyle = `
            linear-gradient(
                to right, 
                transparent 0%, 
                ${value <= 0 ? `transparent ${finalPercent}%,` : `rgba(var(--super-pink), 5%) ${(parametric * 10) + 45}%,`} 
                ${value <= 0 ? `rgb(var(--super-blue)) ${finalPercent}%,` : `rgba(var(--super-pink), 100%) ${zeroPercentVal}%,`}  
                rgba(var(${value <= 0 ? "--super-blue" : "--super-pink"}), 100%) ${zeroPercentVal}%, 
                ${value >= 0 ? `rgb(var(--super-pink)) ${finalPercent}%,` : `rgba(var(--super-blue), 100%) ${zeroPercentVal}%,`}  
                ${value >= 0 ? `transparent ${finalPercent}%,` : `rgba(var(--super-blue), 5%) ${(parametric * 10) + 45}%,`}  
                transparent 100%
            )`;
        }
        this.customStyleElem.textContent = `#${this.id}::-webkit-slider-runnable-track {
            background: ${bgStyle};   
        }
        #${this.id}::-moz-range-track {
            background: ${bgStyle};
            background-clip: padding-box;
        }
        `;

        const barLeftPix = this.sliderElement.offsetLeft + (this.sliderElement.offsetWidth * valuePercent) + thumbOffset;
        indicator.innerHTML = `${value}<span></span>`;
        indicator.style.left = `${barLeftPix}px`;
    }

}
