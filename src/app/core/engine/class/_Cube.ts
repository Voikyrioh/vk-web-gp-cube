/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import { Vector3 } from "../Maths/Vector/Vector3.ts";

export enum Sides {
    FACE ,
    BOTTOM ,
    RIGHT ,
    LEFT ,
    TOP ,
    BACK ,
}

export class Cube {
    static VertexesCount: number = 6*6;
    static Vertexes: number[][] = [
        [-1,  -1, 1],
        [-1,   1, 1],
        [ 1,   1, 1],
        [ 1,   1, 1],
        [ 1,  -1, 1],
        [-1,  -1, 1],
    ];

    static FacesTexturesCoordinates: Record<Sides, number[][]> = {
        [Sides.FACE]: [
            [1/4, 2/3], [1/4, 1/3], [1/2, 1/3],  [1/2, 1/3], [1/2, 2/3],[1/4, 2/3]
        ],
        [Sides.BOTTOM]: [
            [1/4, 1], [1/4, 2/3], [1/2, 2/3], [1/2, 2/3], [1/2, 1],[1/4, 1]
        ],
        [Sides.RIGHT]: [
            [1/2, 2/3], [1/2, 1/3], [3/4, 1/3], [3/4, 1/3], [3/4, 2/3], [1/2, 2/3]
        ],
        [Sides.LEFT]: [
            [0, 2/3], [0, 1/3], [1/4, 1/3], [1/4, 1/3], [1/4, 2/3], [0, 2/3]
        ],
        [Sides.TOP]: [
            [1/4, 1/3], [1/4, 0], [1/2, 0], [1/2, 0], [1/2, 1/3], [1/4, 1/3]
        ],
        [Sides.BACK]: [
            [3/4, 2/3], [3/4, 1/3], [1, 1/3], [1, 1/3], [1, 2/3], [3/4, 2/3]
        ],
    };

    static CubeFaceRotations: Record<Sides, (v:Vector3)=>Vector3> = {
        [Sides.FACE]: (v: Vector3) => new Vector3(-v.x, v.y, v.z),
        [Sides.BOTTOM]:  (v: Vector3) => new Vector3(v.x, -v.z, -v.y),
        [Sides.RIGHT]: (v: Vector3) => new Vector3(v.z, v.y, v.x),
        [Sides.LEFT]:  (v: Vector3) => new Vector3(-v.z, v.y, -v.x),
        [Sides.TOP]:  (v: Vector3) => new Vector3(v.x, v.z, v.y),
        [Sides.BACK]:  (v: Vector3) => new Vector3(v.x, v.y, -v.z),
    };

    private _obfuscatedSide: boolean[];
    private _cubeVertexesCount: number;
    coordinates: Vector3;
    sides!: Vector3[][];

    constructor(props: { coordinates: Vector3 }) {
        this.coordinates = props.coordinates;
        this._obfuscatedSide = [false, false, false, false, false, false];
        this._cubeVertexesCount = 6*6;
        this.reloadCubeState();
    }

    private reloadCubeState() {
        const generateSides = [ Sides.FACE, Sides.BOTTOM, Sides.RIGHT, Sides.LEFT, Sides.TOP, Sides.BACK];
        this.sides = generateSides.map(side => {
            return Cube.Vertexes.map(point => Cube.CubeFaceRotations[side](Vector3.fromArray(point as [number,number,number])).add(this.coordinates))
        });
    }

    public toVertexes(): number[] {
        return this.toFaceVertexes().flat(1)
    }

    public setObfuscatedSide(value: boolean[]) {
        this._obfuscatedSide = value;
        this._cubeVertexesCount = this._obfuscatedSide.filter(s => !s).length * 6;
    }

    public getCubeVertexesCount(): number {
        return this._cubeVertexesCount;
    }

    public toFaceVertexes(): number[][] {
        return [
            this.sides[Sides.FACE].map((point, i) => [...point.toArray(), ...Cube.FacesTexturesCoordinates[Sides.FACE][i]]).flat(1),
            this.sides[Sides.BOTTOM].map((point, i) => [...point.toArray(), ...Cube.FacesTexturesCoordinates[Sides.BOTTOM][i]]).flat(1),
            this.sides[Sides.RIGHT].map((point, i) => [...point.toArray(), ...Cube.FacesTexturesCoordinates[Sides.RIGHT][i]]).flat(1),
            this.sides[Sides.LEFT].map((point, i) => [...point.toArray(), ...Cube.FacesTexturesCoordinates[Sides.LEFT][i]]).flat(1),
            this.sides[Sides.TOP].map((point, i) => [...point.toArray(), ...Cube.FacesTexturesCoordinates[Sides.TOP][i]]).flat(1),
            this.sides[Sides.BACK].map((point, i) => [...point.toArray(), ...Cube.FacesTexturesCoordinates[Sides.BACK][i]]).flat(1),
        ].filter((side: number[], index: Sides) => !this._obfuscatedSide[index]);
    }
}
