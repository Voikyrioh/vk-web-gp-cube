/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import Vector3 from "./Vector3.ts";
import SimpleTriangle from "./SimpleTriangle.ts";
import {CubeFaceVertexes, TriangleVertexes} from "../types/Geometry.ts";
import {Colors} from "../types/BasicTypes.ts";
import {adaptatorHeight, adaptatorWidth} from "../../../constants/defaults.ts";

export enum Sides {
    FACE = 'face',
    TOP = 'top',
    RIGHT = 'right',
    BOTTOM = 'bottom',
    LEFT = 'left',
    BACK = 'back',
}

export class Cube {
    static VertexesCount: number = 6*6;
    static Vertexes: CubeFaceVertexes = [   // FACE
            [ 1,   1, 1],
            [-1,   1, 1],
            [-1,  -1, 1],
            [ 1,   1, 1],
            [ 1,  -1, 1],
            [-1,  -1, 1],
        ];
    static FaceColors: Record<Sides, Colors> = {
        [Sides.FACE]: Colors.Green,
        [Sides.BOTTOM]: Colors.Cyan,
        [Sides.RIGHT]: Colors.Yellow,
        [Sides.LEFT]: Colors.Magenta,
        [Sides.TOP]: Colors.Blue,
        [Sides.BACK]: Colors.Red,
    };
    static TextureVertexes : CubeFaceVertexes[] = [];
    static CubeFaceRotations: Record<Sides, (v:Vector3)=>Vector3> = {
        [Sides.FACE]: (v: Vector3) => new Vector3(v.x, v.y, -v.z),
        [Sides.BOTTOM]:  (v: Vector3) => new Vector3(v.z, v.y, v.x),
        [Sides.RIGHT]: (v: Vector3) => new Vector3(-v.z, v.y, -v.x),
        [Sides.LEFT]:  (v: Vector3) => new Vector3(-v.x, v.y, v.z),
        [Sides.TOP]:  (v: Vector3) => new Vector3(v.x, -v.z, -v.y),
        [Sides.BACK]:  (v: Vector3) => new Vector3(v.x, v.z, v.y),
    };


    texture?: Blob;
    coordinates: Vector3;
    size: number;
    cubePosition: CubeFaceVertexes = Cube.Vertexes;
    sides!: Record<Sides, [SimpleTriangle, SimpleTriangle]>;
    private distance: number = 0;

    private generateSides(angle: Vector3) {
        const generateSides = [ Sides.FACE, Sides.BOTTOM, Sides.RIGHT, Sides.LEFT, Sides.TOP, Sides.BACK];
        this.distance;
        this.sides = Object.fromEntries(
            generateSides.map(s => [
                    s,
                    [
                        new SimpleTriangle({
                            a: Vector3.fromArray(angle.toArray()),
                            coords: this.cubePosition
                                .slice(0,3)
                                .map(point => Vector3.fromArray(point))
                                .map(Cube.CubeFaceRotations[s])
                                .map((val) => Cube.translateVertexes(val, this.coordinates))
                                .map((vec) => Vector3.fromArray([vec.x*((this.size/2)/adaptatorWidth),vec.y*((this.size/2)/adaptatorHeight),vec.z*((this.size/2)/adaptatorWidth)]))
                                .map((vector: Vector3) => Vector3.computeCoordinatesRotation(vector,Vector3.fromArray(angle.toArray()))) as TriangleVertexes
                        }),
                        new SimpleTriangle({
                            a: Vector3.fromArray(angle.toArray()),
                            coords: this.cubePosition
                                .slice(3)
                                .map(point => Vector3.fromArray(point))
                                .map(Cube.CubeFaceRotations[s])
                                .map((val) => Cube.translateVertexes(val, this.coordinates))
                                .map((vec) => Vector3.fromArray([vec.x*((this.size/2)/adaptatorWidth),vec.y*((this.size/2)/adaptatorHeight),vec.z*((this.size/2)/adaptatorWidth)]))
                                .map((vector: Vector3) => Vector3.computeCoordinatesRotation(vector,Vector3.fromArray(angle.toArray()))) as TriangleVertexes
                        })
                    ]
                ]
            )
        ) as Record<Sides, [SimpleTriangle, SimpleTriangle]>;
    };

    constructor(props: {coordinates: Vector3, size: number, angle: Vector3, distance: number}) {
        this.coordinates = props.coordinates;
        this.size = props.size;
        this.distance = props.distance;
        this.generateSides(props.angle);
    }

    toVertexes(): number[] {
        return Object.entries(this.sides)
            .map(([key, value]) =>
                value.map(triangle => {
                    const trianglePoints = triangle.computeVertexes();
                    const pointsVert = [
                        trianglePoints.slice(0, 3),
                        trianglePoints.slice(3,6),
                        trianglePoints.slice(6)
                    ]
                    return pointsVert.map(pts => [...pts, ...Vector3.fromHex(Cube.FaceColors[key as Sides]).toArray()]).flat();
                })).flat()
            .flat()
    }

    private static translateVertexes(vert: Vector3, coordinates: Vector3): Vector3 {
        const [x,y,z] = vert.toArray();
        return Vector3.fromArray([
            x + (coordinates.x / adaptatorWidth),
            y + (coordinates.y / adaptatorHeight),
            z + (coordinates.z / adaptatorWidth),
        ]);
    }
}
