import { Vector3 } from "../Maths/Vector/Vector3.ts";
import {Matrix4Array} from "../Maths/types/Matrix.ts";
import {ControlKeys, Controls} from "./Controls.ts";
import {clamp, rotationReset} from "../Maths/Functions/Utils";
import {Matrix4} from "../Maths/Matrix/Matrix4.ts";
import {RotationMatrix3DX, RotationMatrix3DY, Translation3DMatrix} from "../Maths/Functions/3DMatrixOperations.ts";

interface Movements {
    forward:    1|0;
    back:       1|0;
    left:       1|0;
    right:      1|0;
    up:         1|0;
    down:       1|0;
}

export class Camera {
    public fov: number;
    public position: Vector3;
    public rotation: Vector3;
    private view = new Matrix4([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
    private maxSpeed = 800;
    private acceleration = 100;
    private controls: Controls;
    accelerationVector = Vector3.fromArray([0,0,0]);

    constructor(fov: number, position: Vector3, canvas: GPUCanvasContext) {
        this.fov = fov;
        this.position = position;
        this.rotation = Vector3.fromArray([0,0,0]);
        this.controls = new Controls('azerty', canvas);
        this.connectMouseToCamera(canvas);
    }

    private updateView() {
        this.view = new Matrix4(Translation3DMatrix(this.position))
            .multiply(RotationMatrix3DY(rotationReset(this.rotation.y)))
            .multiply(RotationMatrix3DX(clamp(this.rotation.x, -Math.PI/2, Math.PI/2)))
    }

    getCameraMatrix(): Matrix4Array {
        this.updateView();

        return Matrix4.inverse2(this.view.toArray());
    }

    private getSideMovementValue(accVector: Vector3): number {
        const {cos, sin} = Math;
        const cosFactor = cos(this.rotation.y)*(accVector.y); // works
        const sinFactor = sin(this.rotation.y)*(accVector.x * -1); // works

        return cosFactor + sinFactor;
    }

    private getForwardMovementValue(accVector: Vector3): number {
        const {cos, sin} = Math;
        const cosFactor = cos(this.rotation.y)*(accVector.x); // works
        const sinFactor = sin(this.rotation.y) * (accVector.y);

        return cosFactor + sinFactor;
    }

    private setAccelerationVector(movement: Movements, time: number): Vector3 {
        const [x,y,z] = this.accelerationVector.copy().toArray();
        const accFactor = this.acceleration * (time/10);

        const mx = (movement.back - movement.forward);
        const my = (movement.right - movement.left);
        const mz = (movement.up - movement.down);
        this.accelerationVector =  new Vector3(
            clamp(x + (mx  * accFactor), this.maxSpeed * -1, this.maxSpeed) * (mx ? 1 : 0.95),
            clamp(y + (my  * accFactor) ,this.maxSpeed * -1, this.maxSpeed) * (my ? 1 : 0.95),
            clamp(z + (mz  * this.maxSpeed * 1000), this.maxSpeed * -1 * 2, this.maxSpeed * 2)
        );

        return this.accelerationVector.copy();
    }


    move(time: number): Promise<void> {
        return new Promise(resolve => {
            if (document.pointerLockElement) {

                const movement: Movements = {
                    forward: this.controls.pressedKeys[ControlKeys.forward] ? 1 : 0,
                    back: this.controls.pressedKeys[ControlKeys.back] ? 1 : 0,
                    left: this.controls.pressedKeys[ControlKeys.left] ? 1 : 0,
                    right: this.controls.pressedKeys[ControlKeys.right] ? 1 : 0,
                    up: this.controls.pressedKeys[ControlKeys.up] ? 1 : 0,
                    down: this.controls.pressedKeys[ControlKeys.down] ? 1 : 0
                };

                const accel = this.setAccelerationVector(movement, time / 1000);

                this.position = this.position.copy().add(Vector3.fromArray([
                    this.getSideMovementValue(accel),
                    (movement.up - movement.down),
                    this.getForwardMovementValue(accel)
                ]));
            }
            resolve();
        })

    }

    private connectMouseToCamera(canvas: GPUCanvasContext) {
            // @ts-ignore
            canvas.canvas.addEventListener('mousemove', ({movementX: x, movementY: y}: MouseEvent) => {
                if (document.pointerLockElement){
                    this.rotation = this.rotation.add(Vector3.fromArray([
                        y * Math.PI/180,
                        x * Math.PI/180,
                        0
                    ]));
                }
            });
    }
}
