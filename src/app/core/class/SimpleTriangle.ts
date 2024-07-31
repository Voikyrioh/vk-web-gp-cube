import { Geometry } from "../types";
import Vector3 from "../class/Vector3.ts";

export interface InitSimpleTriangleProperties /* extends Basic.Vector3 */ {
    a: Vector3;
    coords: [Vector3, Vector3, Vector3];
}

export default class SimpleTriangle {
    private pointCoordinates: Geometry.TrianglePointCoordinates;

    constructor(initParams: InitSimpleTriangleProperties) {
        this.pointCoordinates = {
            a: initParams.coords[0],
            b: initParams.coords[1],
            c: initParams.coords[2]
        };
    }

    public computeVertexes(): number[] {
        const trueCoordinates: Geometry.TrianglePointCoordinates = this.pointCoordinates;
        const pointArray: Vector3[] = [
            trueCoordinates.a,
            trueCoordinates.b,
            trueCoordinates.c
        ];

        return pointArray.map(c=> c.toArray()).flat() as number[];
    }
}
