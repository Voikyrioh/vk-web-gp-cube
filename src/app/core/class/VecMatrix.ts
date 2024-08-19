/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import Vector3 from "./Vector3.ts";

type MatrixArray = [
    number, number, number,
    number, number, number,
    number, number, number,
];

type MatrixArrayRow = [
    number, number, number
];

type MatrixArrayColumn = [
    number, number, number
];

export class VecMatrix {
    static RotationMatrixX: (angle:number) => MatrixArray = (angle) => ([
        1,                  0,                  0,
        0,                  Math.cos(angle),    -Math.sin(angle),
        0,                  Math.sin(angle),    Math.cos(angle),
    ]);

    static RotationMatrixY: (angle:number) => MatrixArray = (angle) => ([
        Math.cos(angle),    0,                  Math.sin(angle),
        0,                  1,                  0,
        -Math.sin(angle),    0,                  Math.cos(angle),
    ]);

    static RotationMatrixZ: (angle:number) => MatrixArray = (angle) => ([
        Math.cos(angle),    -Math.sin(angle),   0,
        Math.sin(angle),    Math.cos(angle),    0,
        0,                  0,                  1,
    ]);

    static TranslationMatrix: (t: Vector3) => MatrixArray = (t: Vector3) => ([
        1, 1, 1,
        1, 1, 1,
        t.x, t.y, t.z,
    ])

    private readonly matrix: MatrixArray = Array(9*9) as MatrixArray;
    public readonly rows: [MatrixArrayRow, MatrixArrayRow, MatrixArrayRow] = [
        Array<number>(3) as MatrixArrayRow,
        Array<number>(3) as MatrixArrayRow,
        Array<number>(3) as MatrixArrayRow
    ];
    public readonly columns: [MatrixArrayColumn,MatrixArrayColumn,MatrixArrayColumn] = [
        Array<number>(3) as MatrixArrayColumn,
        Array<number>(3) as MatrixArrayColumn,
        Array<number>(3) as MatrixArrayColumn
    ];

    constructor(matrix: MatrixArray) {
        // Double-checking if the value and length is correct
        this.matrix = Array(9).fill(null).map((_, index) => Number(matrix[index]) || 0) as MatrixArray;

        // Define rows
        this.rows = [
            this.matrix.slice(0, 3) as MatrixArrayRow,
            this.matrix.slice(3, 6) as MatrixArrayRow,
            this.matrix.slice(6, 9) as MatrixArrayRow
        ];

        // Define columns
        this.columns = [
            this.matrix.filter((_,index) => [1,4,7].includes(index + 1)) as MatrixArrayColumn,
            this.matrix.filter((_,index) => [2,5,8].includes(index + 1)) as MatrixArrayColumn,
            this.matrix.filter((_,index) => [3,6,9].includes(index + 1)) as MatrixArrayColumn
        ];
    }

    public static getRotationMatrice(angles: Vector3): MatrixArray {
        return [
            VecMatrix.RotationMatrixX(angles.x),
            VecMatrix.RotationMatrixY(angles.y),
            VecMatrix.RotationMatrixZ(angles.z),
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
