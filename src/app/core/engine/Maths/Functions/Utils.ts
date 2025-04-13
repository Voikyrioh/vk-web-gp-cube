import {Vector3} from "../Vector/Vector3.ts";

export function convertHexaStringToDecimalVector(hex: string): Vector3 {
    if(hex.length > 7 || hex.length < 6 || (hex.length === 7 && hex.charAt(0) !== "#")) {
        throw new Error("Invalid hex format.");
    }
    if (hex.charAt(0) === "#") {
        hex = hex.slice(1);
    }
    const [x, y, z] = hex.match(/.{1,2}/g)!.map((c) => parseInt(c, 16));

    return new Vector3(x/255,y/255,z/255);
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
export function rotationReset(angleRad: number): number {
    const sign = Math.sign(angleRad);
    let bufferAngle = Math.abs(angleRad);
    while (bufferAngle > 2 * Math.PI) bufferAngle -= 2 * Math.PI;

    return bufferAngle * sign;
}
