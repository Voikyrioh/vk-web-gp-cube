import {Matrix4Array} from "../types/Matrix.ts";
import {Matrix} from "./Matrix.ts";


export class Matrix4 extends Matrix<Matrix4Array> {
    constructor(array: Matrix4Array) {
        super(array);
    }

    public static F32Size = 64;
    public multiply(matrix: Matrix4|Matrix4Array): Matrix4 {
        return new Matrix4(Matrix4.multiply(this, matrix));
    }

    public inverse(): Matrix4 {
        return new Matrix4(Matrix4.inverse(this));
    }

    public static multiply(m1: Matrix4|Matrix4Array, m2: Matrix4|Matrix4Array): Matrix4Array {
        const ma: Matrix4 = Object.prototype.hasOwnProperty.call(m1,  "length") ? new Matrix4(m1 as Matrix4Array) : m1 as Matrix4
        const mb: Matrix4 = Object.prototype.hasOwnProperty.call(m2,  "length") ? new Matrix4(m2 as Matrix4Array) : m2 as Matrix4

        return mb.rows()
            .map((rowB) => {
                return rowB.map((_, rowBIndex) => {
                    return rowB.map((value, valIndex) => value * ma.columns()[rowBIndex][valIndex]).reduce((a, b) => a + b);
                });
            }).flat() as Matrix4Array;
    }

    public static inverse(mat: Matrix4|Matrix4Array): Matrix4Array {
        const matrix: Matrix4 = Object.prototype.hasOwnProperty.call(mat,  "length") ? new Matrix4(mat as Matrix4Array) : mat as Matrix4
        const n = 4;
        let augmentedMatrix: number[][] = [];

        // Construire la matrice augmentée [A | I]
        for (let i = 0; i < n; i++) {
            augmentedMatrix[i] = [...matrix.rows()[i], ...Array(n).fill(0)];
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

        return inverse.flat(1) as Matrix4Array;
    }

    public static inverse2(m: Matrix4Array): Matrix4Array {
        const dst = new Array(16);

        const m00 = m[0];
        const m01 = m[1];
        const m02 = m[2];
        const m03 = m[3];
        const m10 = m[4];
        const m11 = m[5];
        const m12 = m[6];
        const m13 = m[7];
        const m20 = m[8];
        const m21 = m[9];
        const m22 = m[10];
        const m23 = m[11];
        const m30 = m[12];
        const m31 = m[13];
        const m32 = m[14];
        const m33 = m[15];

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


        return dst as Matrix4Array;
    }

    public rows(): number[][] {
        return [
            this.matrix.slice(0,4),
            this.matrix.slice(4,8),
            this.matrix.slice(8,12),
            this.matrix.slice(12,16),
        ]
    }

    public columns(): number[][] {
        return [
            [this.matrix[0], this.matrix[4], this.matrix[8], this.matrix[12]],
            [this.matrix[1], this.matrix[5], this.matrix[9], this.matrix[13]],
            [this.matrix[2], this.matrix[6], this.matrix[10], this.matrix[14]],
            [this.matrix[3], this.matrix[7], this.matrix[11], this.matrix[15]]
        ];
    }
}
