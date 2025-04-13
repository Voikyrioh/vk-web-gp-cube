import {MatrixArray} from "../types/Matrix.ts";

export class Matrix<M extends MatrixArray> {
    protected matrix: M;

    protected constructor(matrix: M) {this.matrix = matrix;}

    public toArray(): M {
        return this.matrix;
    }
    static FromArray<T extends MatrixArray>(array: T): Matrix<T> {
        return new Matrix<T>(array);
    }

}
