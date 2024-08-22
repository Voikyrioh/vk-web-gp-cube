/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import Vector3 from "./Vector3.ts";
import {adaptatorHeight, adaptatorWidth} from "../../../constants/defaults.ts";

type MatrixArray = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

type MatrixArrayRow = [
    number, number, number, number
];

type MatrixArrayColumn = [
    number, number, number, number
];

export class VecMatrix {
    static RotationMatrixX: (angle:number) => MatrixArray = (angle) => ([
        1,                  0,                  0,                  0,
        0,                  Math.cos(angle),    -Math.sin(angle),   0,
        0,                  Math.sin(angle),    Math.cos(angle),    0,
        0,                  0,                  0,                  1,
    ]);

    static RotationMatrixY: (angle:number) => MatrixArray = (angle) => ([
        Math.cos(angle),    0,                  Math.sin(angle),    0,
        0,                  1,                  0,                  0,
        -Math.sin(angle),   0,                  Math.cos(angle),    0,
        0,                  0,                  0,                  1,
    ]);

    static RotationMatrixZ: (angle:number) => MatrixArray = (angle) => ([
        Math.cos(angle),    -Math.sin(angle),   0,                  0,
        Math.sin(angle),    Math.cos(angle),    0,                  0,
        0,                  0,                  1,                  0,
        0,                  0,                  0,                  1,
    ]);

    static TranslationMatrix: (t: Vector3) => MatrixArray = (t: Vector3) => ([
        1,                  0,                  0,                  0,
        0,                  1,                  0,                  0,
        0,                  0,                  1,                  0,
        t.x,                t.y,                t.z,                1,
    ]);

    static GridSpaceMatrix: (left: number, right: number, bottom: number, top: number, near: number, far: number) => MatrixArray = (left, right, bottom, top, near, far) => ([
        2/(right - left),                   0,                                  0,                      0,
        0,                                  2/(top - bottom),                   0,                      0,
        0,                                  0,                                  1/(near - far),         0,
        (right + left) / (left - right),    (top + bottom) / (bottom - top),    near / (near - far),    1,
    ]);

    static ScalingMatrix: (vector: Vector3) => MatrixArray = (vector: Vector3) => ([
        vector.x,           0,                  0,                  0,
        0,                  vector.y,           0,                  0,
        0,                  0,                  vector.z,           0,
        0,                  0,                  0,                  1,
    ]);

    private readonly matrix: MatrixArray = Array(16*16) as MatrixArray;
    public readonly rows: [MatrixArrayRow, MatrixArrayRow, MatrixArrayRow, MatrixArrayRow] = [
        Array<number>(4) as MatrixArrayRow,
        Array<number>(4) as MatrixArrayRow,
        Array<number>(4) as MatrixArrayRow,
        Array<number>(4) as MatrixArrayRow
    ];
    public readonly columns: [MatrixArrayColumn, MatrixArrayColumn, MatrixArrayColumn, MatrixArrayColumn] = [
        Array<number>(4) as MatrixArrayColumn,
        Array<number>(4) as MatrixArrayColumn,
        Array<number>(4) as MatrixArrayColumn,
        Array<number>(4) as MatrixArrayColumn
    ];

    constructor(matrix: MatrixArray) {
        // Double-checking if the value and length is correct
        this.matrix = Array(16).fill(null).map((_, index) => Number(matrix[index]) || 0) as MatrixArray;

        // Define rows
        this.rows = [
            this.matrix.slice(0, 4) as MatrixArrayRow,
            this.matrix.slice(4, 8) as MatrixArrayRow,
            this.matrix.slice(8, 12) as MatrixArrayRow,
            this.matrix.slice(12, 16) as MatrixArrayRow
        ];

        // Define columns
        this.columns = [
            this.matrix.filter((_,index) => [1, 5,  9, 13].includes(index + 1)) as MatrixArrayColumn,
            this.matrix.filter((_,index) => [2, 6, 10, 14].includes(index + 1)) as MatrixArrayColumn,
            this.matrix.filter((_,index) => [3, 7, 11, 15].includes(index + 1)) as MatrixArrayColumn,
            this.matrix.filter((_,index) => [4, 8, 12, 16].includes(index + 1)) as MatrixArrayColumn
        ];
    }

    public static get3DObjectMatrix(translations: Vector3, scale: Vector3, rotations: Vector3): MatrixArray {
        return [
            VecMatrix.GridSpaceMatrix(0, adaptatorWidth, 0, adaptatorHeight, 400, -400),
            VecMatrix.TranslationMatrix(translations),
            VecMatrix.RotationMatrixX(rotations.x),
            VecMatrix.RotationMatrixY(rotations.y),
            VecMatrix.RotationMatrixZ(rotations.z),
            VecMatrix.ScalingMatrix(scale),
        ].reduce(VecMatrix.multiply);
    }

    public getMatrix(): MatrixArray {
        return this.matrix;
    }

    public static multiply(m1: VecMatrix|MatrixArray, m2: VecMatrix|MatrixArray): MatrixArray {
        const ma: VecMatrix = Object.prototype.hasOwnProperty.call(m1,  "length") ? new VecMatrix(m1 as MatrixArray) : m1 as VecMatrix
        const mb: VecMatrix = Object.prototype.hasOwnProperty.call(m2,  "length") ? new VecMatrix(m2 as MatrixArray) : m2 as VecMatrix

        return mb.rows
            .map((rowB) => {
                return rowB.map((_, rowBIndex) => {
                    return rowB.map((value, valIndex) => value * ma.columns[rowBIndex][valIndex]).reduce((a, b) => a + b);
                });
            }).flat() as MatrixArray;
    }

    public static addVertexFloat32Padding(mat: MatrixArray): number[] {
        const matrix = new VecMatrix(mat);

        return [
            ...matrix.rows[0], 0,
            ...matrix.rows[1], 0,
            ...matrix.rows[2], 0
        ]
    }
}
