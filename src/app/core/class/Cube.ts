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

type TriangeTextureCoordinates = [ [number, number], [number, number], [number, number] ];

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
    static FacesTexturesCoordinates: Record<Sides, [TriangeTextureCoordinates,TriangeTextureCoordinates]> = {
        [Sides.FACE]: [
            [ [1/2, 1/3], [1/4, 1/3], [1/4, 2/3] ], [ [1/2, 1/3], [1/2, 2/3], [1/4, 2/3] ]
        ],
        [Sides.BOTTOM]: [
            [ [1/2, 2/3], [1/4, 2/3], [1/4, 1] ], [ [1/2, 2/3], [1/2, 1], [1/4, 1] ]
        ],
        [Sides.RIGHT]: [
            [ [3/4, 1/3], [1/2, 1/3], [1/2, 2/3] ], [ [3/4, 1/3], [3/4, 2/3], [1/2, 2/3] ]
        ],
        [Sides.LEFT]: [
            [ [1/4, 1/3], [0, 1/3], [0, 2/3] ], [ [1/4, 1/3], [1/4, 2/3], [0, 2/3] ]
        ],
        [Sides.TOP]: [
            [ [1/2, 0], [1/4, 0], [1/4, 1/3] ], [ [1/2, 0], [1/2, 1/3], [1/4, 1/3] ]
        ],
        [Sides.BACK]: [
            [ [1, 1/3], [3/4, 1/3], [3/4, 2/3] ], [ [1, 1/3], [1, 2/3], [3/4, 2/3] ]
        ],
    }

    static TextureVertexes : CubeFaceVertexes[] = [];
    static CubeFaceRotations: Record<Sides, (v:Vector3)=>Vector3> = {
        [Sides.FACE]: (v: Vector3) => new Vector3(-v.x, v.y, v.z),
        [Sides.BOTTOM]:  (v: Vector3) => new Vector3(v.x, -v.z, -v.y),
        [Sides.RIGHT]: (v: Vector3) => new Vector3(v.z, v.y, v.x),
        [Sides.LEFT]:  (v: Vector3) => new Vector3(-v.z, v.y, -v.x),
        [Sides.TOP]:  (v: Vector3) => new Vector3(v.x, v.z, v.y),
        [Sides.BACK]:  (v: Vector3) => new Vector3(v.x, v.y, -v.z),
    };


    texture: Promise<HTMLImageElement>;
    coordinates: Vector3;
    angle: Vector3;
    size: number;
    cubePosition: CubeFaceVertexes = Cube.Vertexes;
    sides!: Record<Sides, [SimpleTriangle, SimpleTriangle]>;
    private distance: number = 0;
    private vertexCoeff: number;

    private generateSides() {
        const generateSides = [ Sides.FACE, Sides.BOTTOM, Sides.RIGHT, Sides.LEFT, Sides.TOP, Sides.BACK];
        this.distance;
        this.vertexCoeff = Math.sqrt(Math.pow(this.size/2, 2) + Math.pow(this.size/2, 2));
        this.sides = Object.fromEntries(
            generateSides.map(s => [
                    s,
                    [
                        new SimpleTriangle({
                            a: Vector3.fromArray(this.angle.toArray()),
                            coords: this.cubePosition
                                .slice(0,3)
                                .map(point => Vector3.fromArray(point))
                                .map(Cube.CubeFaceRotations[s])
                                .map((vector: Vector3) => Vector3.computeCoordinatesRotation(vector,Vector3.fromArray(this.angle.toArray())))
                                .map((vec) => Vector3.fromArray([vec.x*this.vertexCoeff/adaptatorWidth,vec.y*this.vertexCoeff/adaptatorHeight,vec.z*this.vertexCoeff/adaptatorWidth]))
                                .map((val) => Cube.translateVertexes(val, this.coordinates)) as TriangleVertexes
                        }),
                        new SimpleTriangle({
                            a: Vector3.fromArray(this.angle.toArray()),
                            coords: this.cubePosition
                                .slice(3)
                                .map(point => Vector3.fromArray(point))
                                .map(Cube.CubeFaceRotations[s])
                                .map((vector: Vector3) => Vector3.computeCoordinatesRotation(vector,Vector3.fromArray(this.angle.toArray())))
                                .map((vec) => Vector3.fromArray([vec.x*this.vertexCoeff/adaptatorWidth,vec.y*this.vertexCoeff/adaptatorHeight,vec.z*this.vertexCoeff/adaptatorWidth]))
                                .map((val) => Cube.translateVertexes(val, this.coordinates)) as TriangleVertexes
                        })
                    ]
                ]
            )
        ) as Record<Sides, [SimpleTriangle, SimpleTriangle]>;
    };

    constructor(props: {coordinates: Vector3, size: number, angle: Vector3, distance: number, texturePath: string}) {
        this.coordinates = props.coordinates;
        this.size = props.size;
        this.texture = new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = props.texturePath;
        })
        this.vertexCoeff = Math.sqrt(Math.pow(this.size/2, 2) + Math.pow(this.size/2, 2));
        this.distance = props.distance;
        this.angle = props.angle;
        this.generateSides();
    }

    public getCubeTexture(): Promise<HTMLImageElement> {
        return this.texture;
    }

    toVertexes(): number[] {
        this.generateSides();
        return Object.entries(this.sides)
            .sort(([,trianglesA], [,trianglesB]) => SimpleTriangle.sortTriangleByDepth(trianglesA, trianglesB))
            .map(([key, value]) =>
                value.map((triangle, triangleIndex) => {
                    const trianglePoints = triangle.computeVertexes();
                    const pointsVert = [
                        trianglePoints.slice(0, 3),
                        trianglePoints.slice(3,6),
                        trianglePoints.slice(6)
                    ]
                    return pointsVert.map((pts, pointIndex) => [...pts, ...Cube.FacesTexturesCoordinates[key as Sides][triangleIndex][pointIndex]]).flat();
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
