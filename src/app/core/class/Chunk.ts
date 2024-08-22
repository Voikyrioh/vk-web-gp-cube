/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import {Cube} from "./Cube.ts";
import Vector3 from "./Vector3.ts";
import {Slider} from "../../../web/components";

interface controllerAssign {
    posX?: Slider;
    posY?: Slider;
    posZ?: Slider;
    size?: Slider;
    rotateX?: Slider;
    rotateY?: Slider;
    rotateZ?: Slider
}

export class Chunk {
    private static MaxSize: Vector3 = new Vector3(16,1,16);
    public size = new Vector3(100,100,100);
    public pos: Vector3 = Vector3.fromArray([0,200,-600])
    public rotations: Vector3 = Vector3.fromArray([0,0,0])
    chunk: Array<Array<Array<Cube|null>>>;

    constructor(position: Vector3) {
        this.chunk = Array(Chunk.MaxSize.x).fill(Array(Chunk.MaxSize.y).fill(Array(Chunk.MaxSize.z)));
        this.generateChunk(position);
    }

    private generateChunk(position: Vector3) {
        for(let x = 0; x < Chunk.MaxSize.x; x++) {
            for(let y = 0; y < Chunk.MaxSize.y; y++) {
                for (let z = 0; z < Chunk.MaxSize.z; z++) {
                    this.chunk[x][y][z] = new Cube({
                        angle: new Vector3(0, 0, 0),
                        coordinates: new Vector3(0,0,0),
                        distance: 1,
                        size: this.size.x,
                        texturePath: "textures/grassblockAllSides.jpg"
                    });
                }
            }
        }
    }

    public getChunkVertexes(): number[][] {
        const vertexes: number[][] = [];
        for (let z = 0; z < Chunk.MaxSize.z; z++) {
            for(let y = 0; y < Chunk.MaxSize.y; y++) {
                for(let x = 0; x < Chunk.MaxSize.x; x++) {
                    const cube = this.chunk[x][y][z];
                    if (cube) {
                        cube.size = this.size.x/3;
                        cube.coordinates = new Vector3(x-(Chunk.MaxSize.x/2),y-(Chunk.MaxSize.y/2),z-(Chunk.MaxSize.z/2)).multiply(Vector3.fromArray([2, 2, 2]));
                        vertexes.push(cube.toVertexes());
                    }
                }
            }
        }
        return vertexes;
    }

    public attachControls(controllers: controllerAssign) {
        controllers.posX?.attach((value) => { this.pos.x = value})
        controllers.posY?.attach((value) => {this.pos.y = value})
        controllers.posZ?.attach((value) => {this.pos.z = value})
        controllers.rotateX?.attach((value) => {this.rotations.x = value/360*2*Math.PI})
        controllers.rotateY?.attach((value) => {this.rotations.y = value/360*2*Math.PI})
        controllers.rotateZ?.attach((value) => {this.rotations.z = value/360*2*Math.PI})
        controllers.size?.attach((value) => {this.size = new Vector3(value, value, value)})
    }
}
