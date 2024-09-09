/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import {Cube} from "./Cube.ts";
import {Vector3} from "../Maths/Vector/Vector3.ts";

export class Chunk {
    private static MaxSize: Vector3 = new Vector3(16,1,16);
    public size = new Vector3(100,100,100);
    public pos: Vector3 = Vector3.fromArray([0,0,0])
    public rotations: Vector3 = Vector3.fromArray([0,0,0])
    chunk: Array<Array<Array<Cube|null>>> = [];

    constructor(position: Vector3) {
        this.generateChunk(position);
    }

    private generateChunk(position: Vector3) {
        for(let x = 0; x < Chunk.MaxSize.x; x++) {
            this.chunk[x] = []
            for(let y = 0; y < Chunk.MaxSize.y; y++) {
                this.chunk[x][y] = []
                for (let z = 0; z < Chunk.MaxSize.z; z++) {
                    const cube = new Cube({
                        coordinates: (new Vector3(x,y,z).multiply(new Vector3(2, 2, 2)).add(this.pos).copy()),
                    });
                    this.chunk[x][y][z] = cube;
                }
            }
        }
    }

    public getChunkVertexes(): Cube[] {
        return this.chunk.flat(2).filter(c => c !== null)
    }
}
