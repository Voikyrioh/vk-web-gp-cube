/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import {Cube} from "../Cube.ts";
import {Vector3} from "../../Maths/Vector/Vector3.ts";

export class Chunk {
    private static MaxSize = new Vector3(16, 16, 16);
    public size = new Vector3(100, 100, 100);
    private chunkLayer: Map<number, Cube> = new Map<number, Cube>();

    private constructor(public pos: Vector3 = new Vector3(0,0,0)) {
        for(let y = 0; y < Chunk.MaxSize.y; y++) {
            for(let x = 0; x < Chunk.MaxSize.x; x++) {
                for (let z = 0; z < Chunk.MaxSize.z; z++) {
                    this.chunkLayer.set(Chunk.getChunkPos(x,y,z), Cube.create(new Vector3(x,y,z).multiply(new Vector3(2, 2, 2)).add(this.pos)));
                }
            }
        }
    }

    static generateChunk(position?: Vector3): Chunk {
        return new Chunk(position);
    }

    static getChunkPos(x: number, y: number, z: number): number {
        return (x << 8)|(y << 4)|z;
    }

    static getArrayChunkPos(pos: number): Vector3 {
        return new Vector3(pos >> 8, (pos & 0b11110000) >> 4, pos & 0b1111);
    }

    reloadChunkObfuscation(): Promise<void> {
        return new Promise(resolve => {
            for (const pos of this.chunkLayer.keys()) {
                const cube = this.chunkLayer.get(pos)
                if(!cube) continue;
                cube.getFaces().forEach(([side, face]) => {
                    if (!face.getObfuscated()) {
                        let [x,y,z] = Chunk.getArrayChunkPos(pos).add(face.normal).toArray();
                        if (x < 0 || y < 0 || z < 0 || x >= Chunk.MaxSize.x || y >= Chunk.MaxSize.y || z >= Chunk.MaxSize.z) {return;}
                        const opposingCube = this.chunkLayer.get(Chunk.getChunkPos(x,y,z));
                        if (opposingCube) {
                            face.setObfuscated(true);
                            opposingCube.getOpposingFace(side).setObfuscated(true);
                        }
                    }
                })
            }
            resolve();
        })
    }

    getChunkCubes(): IterableIterator<Cube> {
        return this.chunkLayer.values();
    }

}
