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
    private static MaxSize: Vector3 = new Vector3(3,1,1);
    private size = 50;
    public pos: Vector3 = Vector3.fromArray([0,0,1])
    public rotations: Vector3 = Vector3.fromArray([0,0,0])
    //private distance: number = 200;
    chunk: Array<Array<Array<Cube>>>;

    constructor(position: Vector3) {
        this.chunk = Array(Chunk.MaxSize.x).fill(Array(Chunk.MaxSize.y).fill(Array(Chunk.MaxSize.z)));
        this.generateChunk(position);
    }

    private generateChunk(position: Vector3) {
        for (let x = 0; x < Chunk.MaxSize.x; x++) {
            for(let y = 0; y < Chunk.MaxSize.y; y++) {
                for(let z = 0; z < Chunk.MaxSize.z; z++) {
                    const blockPos = new Vector3(
                        position.x + (x - Chunk.MaxSize.x/2) * this.size,
                        position.y + (y - Chunk.MaxSize.y/2) * this.size,
                        position.z + (z - Chunk.MaxSize.z/2) * this.size
                    );

                    this.chunk[x][y][z] = new Cube({
                        angle: new Vector3(0, 0, 0),
                        coordinates: blockPos,
                        distance: 1,
                        size: this.size,
                        texturePath: "textures/grassblockAllSides.jpg"
                    });
                }
            }
        }
    }

    public draw(): number[][] {
        return this.chunk.flat(2).map(block => block.toVertexes());
    }

    public attachControls(controllers: controllerAssign) {
        controllers.posX?.attach((value) => { this.pos.x = value})
        controllers.posY?.attach((value) => {this.pos.y = value})
        controllers.posZ?.attach((value) => {this.pos.z = value})
        controllers.rotateX?.attach((value) => {this.rotations.x = value/360*2*Math.PI})
        controllers.rotateY?.attach((value) => {this.rotations.y = value/360*2*Math.PI})
        controllers.rotateZ?.attach((value) => {this.rotations.z = value/360*2*Math.PI})
        controllers.size?.attach((value) => {this.size = value})
    }
}
