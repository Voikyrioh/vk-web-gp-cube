/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import {_Cube} from "./_Cube.ts";
import {Vector3} from "../Maths/Vector/Vector3.ts";

export class _Chunk {
    private static MaxSize: Vector3 = new Vector3(16,16,16);
    public size = new Vector3(100,100,100);
    public pos: Vector3 = Vector3.fromArray([0,0,0])
    public rotations: Vector3 = Vector3.fromArray([0,0,0])
    chunk: Array<Array<Array<_Cube|null>>> = [];

    constructor(position: Vector3) {
        this.generateChunk(position);
    }

    private generateChunk(position: Vector3) {
        for(let x = 0; x < _Chunk.MaxSize.x; x++) {
            this.chunk[x] = []
            for(let y = 0; y < _Chunk.MaxSize.y; y++) {
                this.chunk[x][y] = []
                for (let z = 0; z < _Chunk.MaxSize.z; z++) {
                    const cube = new _Cube({
                        coordinates: (new Vector3(x,y,z).multiply(new Vector3(2, 2, 2)).add(this.pos).copy()),
                    });
                    this.chunk[x][y][z] = cube;
                }
            }
        }
        for(let x = 0; x < _Chunk.MaxSize.x; x++) {
            for(let y = 0; y < _Chunk.MaxSize.y; y++) {
                for (let z = 0; z < _Chunk.MaxSize.z; z++) {
                    this.chunk[x][y][z]?.setObfuscatedSide([
                        Boolean(this.chunk[x][y][z+1]), // Sides.FACE
                        Boolean(this.chunk[x][y-1]?.[z]), // Sides.BOTTOM
                        Boolean(this.chunk[x+1]?.[y][z]), // Sides.RIGHT
                        Boolean(this.chunk[x-1]?.[y][z]), // Sides.LEFT
                        Boolean(this.chunk[x][y+1]?.[z]), // Sides.TOP
                        Boolean(this.chunk[x][y][z-1]), // Sides.BACK
                    ]);
                }
            }
        }
    }

    public getChunkVertexes(): _Cube[] {
        return this.chunk.flat(2).filter(c => c !== null);
    }
}
