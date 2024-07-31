/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import {PointVertexes} from "./BasicTypes.ts";
import Vector3 from "../class/Vector3.ts";

export type TriangleVertexes = [
    Vector3,
    Vector3,
    Vector3
];

export type CubeFaceVertexes = [
    PointVertexes,
    PointVertexes,
    PointVertexes,
    PointVertexes,
    PointVertexes,
    PointVertexes
];

export interface TrianglePointCoordinates {
    a: Vector3;
    b: Vector3;
    c: Vector3;
}

export interface Quaternion {
    x: [number, number];
    y: [number, number];
    z: [number, number];
}
