/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import { Vector3 } from "../Maths/Vector/Vector3.ts";
import {UvCoordinates} from "../Maths/Vector/uvCoordinates.ts";

export enum Side { FACE, BOTTOM, RIGHT, LEFT, TOP, BACK }
export const opposingSide: Record<Side, Side> = {
    [Side.FACE]: Side.BACK,
    [Side.BOTTOM]: Side.TOP,
    [Side.RIGHT]: Side.LEFT,
    [Side.LEFT]: Side.RIGHT,
    [Side.TOP]: Side.BOTTOM,
    [Side.BACK]: Side.FACE,
}
export type renderVertexes = number[][];

export class PolygonFace {
    private obfuscated: boolean = false;

    private constructor(
        public vertexes: Vector3[],
        public textureUVMap: UvCoordinates[],
        public normal: Vector3,
    ) {}

    static fromVertexes(vertexes: Vector3[]): PolygonFace {
        return new PolygonFace(vertexes, [], new Vector3(0,0,0));
    }

    setTextureUVMap(textureUVMap: UvCoordinates[]): PolygonFace {
        this.textureUVMap = textureUVMap;
        return this;
    }

    setNormal(normal: Vector3): PolygonFace {
        this.normal = normal;
        return this
    }

    compareObfuscation(polygonFace: PolygonFace) {
        if (this.vertexes.length !== polygonFace.vertexes.length) {
            this.obfuscated = false;
            polygonFace.obfuscated = false;
            return;
        }

        const polygonNormal = polygonFace.normal.toArray();
        if (this.normal.toArray().every((value, index) => value + polygonNormal[index] === 0)) {
            this.obfuscated = true;
            polygonFace.obfuscated = true;
            return;
        }

        this.obfuscated = false;
        return;
    }

    getObfuscated(): boolean {
        return this.obfuscated;
    }

    setObfuscated(value: boolean): void {
        this.obfuscated = value;
    }

    render(): number[][] {
        return this.obfuscated ?
            []
            : this.vertexes.map((vertex, i) => [...vertex.toArray(), ...this.textureUVMap[i].toArray()]);
    }
}

export abstract class Polygon {
    protected abstract faces: Map<Side, PolygonFace>;
    abstract toVertexes(): renderVertexes;
}

export class Cube extends Polygon {
    static Vertexes: Vector3[] = [
        Vector3.fromArray([-0.5,  -0.5, 0.5]),
        Vector3.fromArray([-0.5,   0.5, 0.5]),
        Vector3.fromArray([ 0.5,   0.5, 0.5]),
        Vector3.fromArray([ 0.5,   0.5, 0.5]),
        Vector3.fromArray([ 0.5,  -0.5, 0.5]),
        Vector3.fromArray([-0.5,  -0.5, 0.5]),
    ];


    protected faces: Map<Side, PolygonFace>;
    private constructor(public coordinates: Vector3) {
        super();
        this.faces = new Map([
            [Side.FACE, PolygonFace
                .fromVertexes(Cube.Vertexes.map((v: Vector3) => new Vector3(-v.x, v.y, v.z).add(this.coordinates)))
                .setTextureUVMap([[1/4, 2/3], [1/4, 1/3], [1/2, 1/3], [1/2, 1/3], [1/2, 2/3],[1/4, 2/3]].map(uv => UvCoordinates.fromArray(uv as [number, number])))
                .setNormal(new Vector3(0,0, 1))],
            [Side.BOTTOM, PolygonFace
                .fromVertexes(Cube.Vertexes.map((v: Vector3) => new Vector3(v.x, -v.z, -v.y).add(this.coordinates)))
                .setTextureUVMap([[1/4, 1], [1/4, 2/3], [1/2, 2/3], [1/2, 2/3], [1/2, 1],[1/4, 1]].map(uv => UvCoordinates.fromArray(uv as [number, number])))
                .setNormal(new Vector3(0,-1,0))],
            [Side.RIGHT, PolygonFace
                .fromVertexes(Cube.Vertexes.map((v: Vector3) => new Vector3(v.z, v.y, v.x).add(this.coordinates)))
                .setTextureUVMap([[1/2, 2/3], [1/2, 1/3], [3/4, 1/3], [3/4, 1/3], [3/4, 2/3], [1/2, 2/3]].map(uv => UvCoordinates.fromArray(uv as [number, number])))
                .setNormal(new Vector3(1,0,0))],
            [Side.LEFT, PolygonFace
                .fromVertexes(Cube.Vertexes.map((v: Vector3) => new Vector3(-v.z, v.y, -v.x).add(this.coordinates)))
                .setTextureUVMap([ [0, 2/3], [0, 1/3], [1/4, 1/3], [1/4, 1/3], [1/4, 2/3], [0, 2/3]].map(uv => UvCoordinates.fromArray(uv as [number, number])))
                .setNormal(new Vector3(-1,0,0))],
            [Side.TOP, PolygonFace
                .fromVertexes(Cube.Vertexes.map((v: Vector3) => new Vector3(v.x, v.z, v.y).add(this.coordinates)))
                .setTextureUVMap([[1/4, 1/3], [1/4, 0], [1/2, 0], [1/2, 0], [1/2, 1/3], [1/4, 1/3]].map(uv => UvCoordinates.fromArray(uv as [number, number])))
                .setNormal(new Vector3(0,1,0))],
            [Side.BACK, PolygonFace
                .fromVertexes(Cube.Vertexes.map((v: Vector3) => new Vector3(v.x, v.y, -v.z).add(this.coordinates)))
                .setTextureUVMap([[3/4, 2/3], [3/4, 1/3], [1, 1/3], [1, 1/3], [1, 2/3], [3/4, 2/3]].map(uv => UvCoordinates.fromArray(uv as [number, number])))
                .setNormal(new Vector3(0,0,-1))],
        ]);
    }

    static create(coordinates: Vector3): Cube {
        const cube = new Cube(coordinates);

        return cube;
    }

    public isObfuscated(): boolean {
        return Array.from(this.faces.values()).every(face => face.getObfuscated());
    }

    public getFaces(): Readonly<[Side, PolygonFace][]> {
        return Array.from(this.faces.entries());
    }

    public getOpposingFace(side: Side): PolygonFace {
        return this.faces.get(opposingSide[side]) as PolygonFace;
    }

    public toVertexes(): renderVertexes {
        return [...this.faces.values()].map(face => face.render()).flat(1)
    }

    setObfuscatedFace(face: Side) {
        this.faces.get(face)?.setObfuscated(true);
    }
}
