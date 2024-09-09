export enum ControlKeys {
    forward,
    left,
    right,
    back,
    up,
    down,
}

type KeyMap = Readonly<Record<string, ControlKeys>>;
const azertyKeyMap: KeyMap = {
    ['KeyW']: ControlKeys.forward,
    ['KeyA']: ControlKeys.left,
    ['KeyD']: ControlKeys.right,
    ['KeyS']: ControlKeys.back,
    ['Space']: ControlKeys.up,
    ['KeyE']: ControlKeys.down,
}

type SupportedKeyboadLayout = "azerty";

interface ControlsKeys {
    keymap: KeyMap;
    pressedKeys: Record<ControlKeys, boolean>;
}

export class Controls implements ControlsKeys{
    private static readonly KeyboardLayouts: Record<SupportedKeyboadLayout, KeyMap> = {
        azerty: azertyKeyMap
    }

    mouseEvent: Event;
    keymap: KeyMap;
    pressedKeys: Record<ControlKeys, boolean>;

    constructor(layout: SupportedKeyboadLayout, canvas: GPUCanvasContext) {

        this.mouseEvent = new CustomEvent<{x: () => number; y: () => number}>('mousemovement', {
            bubbles: true,
            detail: {
                x: () => 0,
                y: () => 0
            }
        });
        this.keymap = Controls.KeyboardLayouts[layout];
        this.pressedKeys = this.resetPressedKeys(canvas)
    }


    private resetPressedKeys(canvas: GPUCanvasContext): Record<ControlKeys, boolean> {
        canvas.canvas.removeEventListener('keypress', () => {});
        canvas.canvas.removeEventListener('keyup', () => {});

        this.setupKeybindings(this.keymap, canvas);

        return {
            [ControlKeys.forward]: false,
            [ControlKeys.left]: false,
            [ControlKeys.right]: false,
            [ControlKeys.back]: false,
            [ControlKeys.up]: false,
            [ControlKeys.down]: false,
        } ;
    }

    private setupKeybindings(keymap: KeyMap, canvas: GPUCanvasContext) {
        canvas.canvas.addEventListener('keydown', (e: Event) => {
            const event = e as KeyboardEvent;
            e.preventDefault();
            e.stopPropagation();
            if (keymap[event.code] !== undefined) {
                this.pressedKeys[keymap[event.code]] = true;
            }
        });
        canvas.canvas.addEventListener('keyup', (e: Event) => {
            const event = e as KeyboardEvent;
            if (keymap[event.code] !== undefined) {
                this.pressedKeys[keymap[event.code]] = false;
            }
        });
        canvas.canvas.addEventListener('click', (e: Event) => {
            if ("requestPointerLock" in canvas.canvas) {
                canvas.canvas.requestPointerLock();
            }
        })
        canvas.canvas.addEventListener('keydown', (e: Event) => {
            const event = e as KeyboardEvent;
            if (event.code === 'F11') {
                console.log(event);
                event.preventDefault();
                event.stopPropagation();
                if ("requestFullscreen" in canvas.canvas) {
                    canvas.canvas.requestFullscreen().catch(err => console.error(err));
                }
            }
        })
    }
}
