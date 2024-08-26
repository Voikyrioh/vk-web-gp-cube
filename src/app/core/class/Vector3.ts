/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import {PointVertexes} from "../types/BasicTypes.ts";

export default class Vector3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number, y: number, z:number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public scale(s: number) {
        this.x = s * this.x;
        this.y = s * this.y;
        this.z = s * this.z;
    }

    public toArray(): PointVertexes {
        return [this.x, this.y, this.z];
    }

    public copy(): Vector3 {
        return Vector3.fromArray(this.toArray());
    }

    public add(vector: Vector3): Vector3 {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;

        return this;
    }

    public multiply(vector: Vector3): Vector3 {
        this.x *= vector.x;
        this.y *= vector.y;
        this.z *= vector.z;

        return this;
    }

    public divide(vector: Vector3): Vector3 {
        this.x /= vector.x;
        this.y /= vector.y;
        this.z /= vector.z;

        return this;
    }

    static fromArray(array: PointVertexes): Vector3 {
        return new this(...array);
    }

    static degreeToRadians(degree: number): number {
        return degree / 360 * 2 * Math.PI;
    }

    static scale(vector: Vector3, scale: number): Vector3 {
        const newVector = vector.copy()
        newVector.scale(scale);

        return newVector;
    }

    static fromHex(hex: string): Vector3 {
        if(hex.length > 7 || hex.length < 6 || (hex.length === 7 && hex.charAt(0) !== "#")) {
            throw new Error("Invalid hex format.");
        }
        if (hex.charAt(0) === "#") {
            hex = hex.slice(1);
        }
        const [x, y, z] = hex.match(/.{1,2}/g)!.map((c) => parseInt(c, 16));

        return new this(x/255,y/255,z/255);
    }
    private static computeX(coords: Vector3, angle: Vector3): number {
        const [A,B,C] = angle.toArray();
        const [i,j,k] = coords.toArray();
        const { cos, sin } = Math;
        return j * sin(A) * sin(B) * cos(C)
            - k * cos(A) * sin(B) * cos(C)
            + j * cos(A) * sin(C)
            + k * sin(A) * sin(C)
            + i * cos(B) * cos(C);
    }


    private static computeY(coords: Vector3, angle: Vector3): number {
        const [A,B,C] = angle.toArray();
        const [i,j,k] = coords.toArray();
        const { cos, sin } = Math;
        return j * cos(A) * cos(C)
            + k * sin(A) * cos(C)
            - j * sin(A) * sin(B) * sin(C)
            + k * cos(A) * sin(B) * sin(C)
            - i * cos(B) * sin(C);
    }

    private static computeZ(coords: Vector3, angle: Vector3): number {
        const [A,B,] = angle.toArray();
        const [i,j,k] = coords.toArray();
        const { cos, sin } = Math;
        return k * cos(A) * cos(B)
            - j * sin(A) * cos(B)
            + i * sin(B);
    }

    static computeCoordinatesRotation(coords: Vector3, angle: Vector3): Vector3 {
        return new Vector3(
            this.computeX(coords, angle),
            this.computeY(coords, angle),
            this.computeZ(coords, angle),
        );
    }

    public toString(): string {
        return `${this.x},${this.y},${this.z}`;
    }

}
