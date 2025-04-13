import { Matrix4Array } from "../types/Matrix.ts";
import {Vector3} from "../Vector/Vector3.ts";

export function RotationMatrix3DX(angleX:number): Matrix4Array {
    return [
        1,      0,                  0,                  0,
        0,      Math.cos(angleX),   -Math.sin(angleX),  0,
        0,      Math.sin(angleX),   Math.cos(angleX),   0,
        0,      0,                  0,                  1,
    ]
}

export function RotationMatrix3DY(angleY:number): Matrix4Array {
    return [
        Math.cos(angleY),   0,       Math.sin(angleY),   0,
        0,                  1,       0,                  0,
        -Math.sin(angleY),  0,       Math.cos(angleY),   0,
        0,                  0,       0,                  1,
    ]
}

export function RotationMatrix3DZ(angleZ:number): Matrix4Array {
    return [
        Math.cos(angleZ),   -Math.sin(angleZ),  0,        0,
        Math.sin(angleZ),   Math.cos(angleZ),   0,        0,
        0,                  0,                  1,        0,
        0,                  0,                  0,        1,
    ]
}

export function Translation3DMatrix(translations: Vector3): Matrix4Array {
    return [
        1,              0,              0,              0,
        0,              1,              0,              0,
        0,              0,              1,              0,
        translations.x, translations.y, translations.z, 1,
    ]
}

export function Get3DGridSpaceMatrix(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
): Matrix4Array {
    return [
        2/(right - left),                   0,                                  0,                      0,
        0,                                  2/(top - bottom),                   0,                      0,
        0,                                  0,                                  1/(near - far),         0,
        (right + left) / (left - right),    (top + bottom) / (bottom - top),    near / (near - far),    1,
    ]
}

export function Scaling3DMatrix(scaling: Vector3): Matrix4Array {
    return [
        scaling.x,          0,                 0,                  0,
        0,                  scaling.y,          0,                 0,
        0,                  0,                  scaling.z,         0,
        0,                  0,                  0,                 1,
    ]
}

export function Fudge(fudge: number): Matrix4Array {
    return [
        1,                  0,                  0,                  0,
        0,                  1,                  0,                  0,
        0,                  0,                  1,                  fudge,
        0,                  0,                  0,                  1,
    ]
}

export function get3DSpacePerspective(
    FovInRad: number,
    aspect: number,
    zNear: number,
    zFar: number
): Matrix4Array {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * FovInRad);
    const rangeInv = 1 / (zNear - zFar);
    return [
        f / aspect,         0,       0,                         0,
        0,                  f,       0,                         0,
        0,                  0,       zFar * rangeInv,           -1,
        0,                  0,       zNear * zFar * rangeInv,   1,
    ]
}
