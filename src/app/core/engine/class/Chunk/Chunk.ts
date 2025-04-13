/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import {Cube} from "../Cube.ts";
import {Vector3} from "../../Maths/Vector/Vector3.ts";

export class Chunk {
    private chunkLayer: Map<number, Cube> = new Map<number, Cube>();

    private constructor(public pos: Vector3 = new Vector3(0,0,0)) {
        for(let k = 0; k < 4096; k++) {
            const [x,y,z] = Chunk.getPos(k);
            const blockPos = new Vector3(x,y,z).add(this.pos);
            this.chunkLayer.set(k, Cube.create(blockPos));
        }
    }

    static getPosValue([x,y,z]: [number,number,number]): number {
        return (x << 8) | (y << 4) | z;
    }

    static getPos(key: number): [number,number,number] {
        return [key >> 8, (key & 240) >> 4, key & 15];
    }

    static generateChunk(position?: Vector3): Chunk {
        return new Chunk(position);
    }

    getChunkCubes(): IterableIterator<Cube> {
        return this.chunkLayer.values();
    }

    getCube(chunkpos: number): Cube | undefined {
        return this.chunkLayer.get(chunkpos);
    }
}
