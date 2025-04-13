import {Vector3} from "../Vector/Vector3.ts";

export function computeRotationX(coords: Vector3, angle: Vector3): number {
    const [A,B,C] = angle.toArray();
    const [i,j,k] = coords.toArray();
    const { cos, sin } = Math;
    return j * sin(A) * sin(B) * cos(C)
        - k * cos(A) * sin(B) * cos(C)
        + j * cos(A) * sin(C)
        + k * sin(A) * sin(C)
        + i * cos(B) * cos(C);
}


export function computeRotationY(coords: Vector3, angle: Vector3): number {
    const [A,B,C] = angle.toArray();
    const [i,j,k] = coords.toArray();
    const { cos, sin } = Math;
    return j * cos(A) * cos(C)
        + k * sin(A) * cos(C)
        - j * sin(A) * sin(B) * sin(C)
        + k * cos(A) * sin(B) * sin(C)
        - i * cos(B) * sin(C);
}

export function computeRotationZ(coords: Vector3, angle: Vector3): number {
    const [A,B,] = angle.toArray();
    const [i,j,k] = coords.toArray();
    const { cos, sin } = Math;
    return k * cos(A) * cos(B)
        - j * sin(A) * cos(B)
        + i * sin(B);
}

export function rotate3DVector(coords: Vector3, angle: Vector3): Vector3 {
    return new Vector3(
        computeRotationX(coords, angle),
        computeRotationY(coords, angle),
        computeRotationZ(coords, angle),
    );
}
