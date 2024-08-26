/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import Vector3 from "./Vector3.ts";
import {adaptatorHeight, adaptatorWidth} from "../../../constants/defaults.ts";

export type MatrixArray = [
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

    static Fudge: (fudge: number) => MatrixArray = (fudge: number) => ([
        1,                  0,                  0,                  0,
        0,                  1,                  0,                  0,
        0,                  0,                  1,                  fudge,
        0,                  0,                  0,                  1,
    ]);

    static FOV: (fieldOfViewYInRadians: number, aspect: number, zNear: number, zFar: number) => MatrixArray = (fov, asp, zn, zf) => {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        const rangeInv = 1 / (zn - zf);
        return [
            f / asp,            0,                  0,                  0,
            0,                  f,                  0,                  0,
            0,                  0,                  zf * rangeInv,     -1,
            0,                  0,                  zn * zf * rangeInv, 1,
        ]
    };

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

    public static get3DObjectMatrix(translations: Vector3, scale: Vector3, rotations: Vector3, fov: number, viewDistance: number): MatrixArray {
        return [
            VecMatrix.FOV(fov,adaptatorWidth/adaptatorHeight, 1, viewDistance),
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

    public multiply(matrix: VecMatrix|MatrixArray): VecMatrix {
        return new VecMatrix(VecMatrix.multiply(this, matrix));
    }

    public inverse(): VecMatrix {
        return new VecMatrix(VecMatrix.inverse(this));
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

    public static inverse(mat: VecMatrix|MatrixArray): MatrixArray {
        const matrix: VecMatrix = Object.prototype.hasOwnProperty.call(mat,  "length") ? new VecMatrix(mat as MatrixArray) : mat as VecMatrix
        const n = 4;
        let augmentedMatrix: number[][] = [];

        // Construire la matrice augmentée [A | I]
        for (let i = 0; i < n; i++) {
            augmentedMatrix[i] = [...matrix.rows[i], ...Array(n).fill(0)];
            augmentedMatrix[i][n + i] = 1;
        }

        // Appliquer l'élimination de Gauss-Jordan
        for (let i = 0; i < n; i++) {
            let pivot = augmentedMatrix[i][i];

            if (pivot === 0) {
                // Trouver une ligne non nulle pour échanger
                for (let j = i + 1; j < n; j++) {
                    if (augmentedMatrix[j][i] !== 0) {
                        [augmentedMatrix[i], augmentedMatrix[j]] = [augmentedMatrix[j], augmentedMatrix[i]];
                        pivot = augmentedMatrix[i][i];
                        break;
                    }
                }
            }

            // Diviser la ligne i par le pivot
            for (let j = 0; j < 2 * n; j++) {
                augmentedMatrix[i][j] /= pivot;
            }

            // Soustraire la ligne pivot des autres lignes
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    const factor = augmentedMatrix[j][i];
                    for (let k = 0; k < 2 * n; k++) {
                        augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
                    }
                }
            }
        }

        // Extraire la partie droite de la matrice augmentée comme l'inverse de A
        let inverse: number[][] = [];
        for (let i = 0; i < n; i++) {
            inverse[i] = augmentedMatrix[i].slice(n, 2 * n);
        }

        return inverse.flat(1) as MatrixArray;
    }

    public static inverse2(m: MatrixArray): MatrixArray {
        const dst = new Array(16);

        const m00 = m[0 * 4 + 0];
        const m01 = m[0 * 4 + 1];
        const m02 = m[0 * 4 + 2];
        const m03 = m[0 * 4 + 3];
        const m10 = m[1 * 4 + 0];
        const m11 = m[1 * 4 + 1];
        const m12 = m[1 * 4 + 2];
        const m13 = m[1 * 4 + 3];
        const m20 = m[2 * 4 + 0];
        const m21 = m[2 * 4 + 1];
        const m22 = m[2 * 4 + 2];
        const m23 = m[2 * 4 + 3];
        const m30 = m[3 * 4 + 0];
        const m31 = m[3 * 4 + 1];
        const m32 = m[3 * 4 + 2];
        const m33 = m[3 * 4 + 3];

        const tmp0 = m22 * m33;
        const tmp1 = m32 * m23;
        const tmp2 = m12 * m33;
        const tmp3 = m32 * m13;
        const tmp4 = m12 * m23;
        const tmp5 = m22 * m13;
        const tmp6 = m02 * m33;
        const tmp7 = m32 * m03;
        const tmp8 = m02 * m23;
        const tmp9 = m22 * m03;
        const tmp10 = m02 * m13;
        const tmp11 = m12 * m03;
        const tmp12 = m20 * m31;
        const tmp13 = m30 * m21;
        const tmp14 = m10 * m31;
        const tmp15 = m30 * m11;
        const tmp16 = m10 * m21;
        const tmp17 = m20 * m11;
        const tmp18 = m00 * m31;
        const tmp19 = m30 * m01;
        const tmp20 = m00 * m21;
        const tmp21 = m20 * m01;
        const tmp22 = m00 * m11;
        const tmp23 = m10 * m01;

        const t0 = (tmp0 * m11 + tmp3 * m21 + tmp4 * m31) -
            (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
        const t1 = (tmp1 * m01 + tmp6 * m21 + tmp9 * m31) -
            (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
        const t2 = (tmp2 * m01 + tmp7 * m11 + tmp10 * m31) -
            (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
        const t3 = (tmp5 * m01 + tmp8 * m11 + tmp11 * m21) -
            (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);

        const d = 1 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        dst[0] = d * t0;
        dst[1] = d * t1;
        dst[2] = d * t2;
        dst[3] = d * t3;

        dst[4] = d * ((tmp1 * m10 + tmp2 * m20 + tmp5 * m30) -
            (tmp0 * m10 + tmp3 * m20 + tmp4 * m30));
        dst[5] = d * ((tmp0 * m00 + tmp7 * m20 + tmp8 * m30) -
            (tmp1 * m00 + tmp6 * m20 + tmp9 * m30));
        dst[6] = d * ((tmp3 * m00 + tmp6 * m10 + tmp11 * m30) -
            (tmp2 * m00 + tmp7 * m10 + tmp10 * m30));
        dst[7] = d * ((tmp4 * m00 + tmp9 * m10 + tmp10 * m20) -
            (tmp5 * m00 + tmp8 * m10 + tmp11 * m20));

        dst[8] = d * ((tmp12 * m13 + tmp15 * m23 + tmp16 * m33) -
            (tmp13 * m13 + tmp14 * m23 + tmp17 * m33));
        dst[9] = d * ((tmp13 * m03 + tmp18 * m23 + tmp21 * m33) -
            (tmp12 * m03 + tmp19 * m23 + tmp20 * m33));
        dst[10] = d * ((tmp14 * m03 + tmp19 * m13 + tmp22 * m33) -
            (tmp15 * m03 + tmp18 * m13 + tmp23 * m33));
        dst[11] = d * ((tmp17 * m03 + tmp20 * m13 + tmp23 * m23) -
            (tmp16 * m03 + tmp21 * m13 + tmp22 * m23));

        dst[12] = d * ((tmp14 * m22 + tmp17 * m32 + tmp13 * m12) -
            (tmp16 * m32 + tmp12 * m12 + tmp15 * m22));
        dst[13] = d * ((tmp20 * m32 + tmp12 * m02 + tmp19 * m22) -
            (tmp18 * m22 + tmp21 * m32 + tmp13 * m02));
        dst[14] = d * ((tmp18 * m12 + tmp23 * m32 + tmp15 * m02) -
            (tmp22 * m32 + tmp14 * m02 + tmp19 * m12));
        dst[15] = d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) -
            (tmp20 * m12 + tmp23 * m22 + tmp17 * m02));


        return dst as MatrixArray;
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
