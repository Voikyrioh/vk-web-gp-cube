import {PointVertexes} from "../../../types/BasicTypes.ts";

export class Vector3 {
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

    public toString(): string {
        return `${this.x},${this.y},${this.z}`;
    }
}
