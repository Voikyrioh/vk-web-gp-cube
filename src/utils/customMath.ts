export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
export function rotationReset(angleRad: number): number {
    const sign = Math.sign(angleRad);
    let bufferAngle = Math.abs(angleRad);
    while (bufferAngle > 2 * Math.PI) bufferAngle -= 2 * Math.PI;

    return bufferAngle * sign;
}
