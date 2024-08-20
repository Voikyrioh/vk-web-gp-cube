/*
Copyright (c) 2024, Yoann Pommier
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
 */

import {Cube} from "./Cube.ts";
import Vector3 from "./Vector3.ts";
import {Slider} from "../../../web/components";

//type controllableProperties = "posX" | "posY" | "posZ" | "distance" | "rotateX" | "rotateY" | "rotateZ" ;
interface controllerAssign {
    posX?: Slider;
    posY?: Slider;
    posZ?: Slider;
    distance?: Slider;
    rotateX?: Slider;
    rotateY?: Slider;
    rotateZ?: Slider
}

export class Chunk {
    //private static TableInit: number [][] = Array(16).fill(Array(16));
    private static MaxSize: Vector3 = new Vector3(16,4,16);
    public pos: Vector3 = Vector3.fromArray([0,0,1])
    private size = 50;
    public rotations: Vector3 = Vector3.fromArray([0,0,0])
    //private distance: number = 200;
    chunk: Record<string, Cube>;

    constructor(position: Vector3) {
        this.chunk = {};
        this.generateChunk(position);
    }

    private generateChunk(position: Vector3) {
        //const chunkBuffer = Chunk.TableInit;
        for (let x = 0; x < Chunk.MaxSize.x; x++) {
            for(let y = 0; y < Chunk.MaxSize.y; y++) {
                for(let z = 0; z < Chunk.MaxSize.z; z++) {
                    const blockPos = new Vector3(
                        position.x + (x - Chunk.MaxSize.x/2) * this.size,
                        position.y + (y - Chunk.MaxSize.y/2) * this.size,
                        position.z + (z - Chunk.MaxSize.z/2) * this.size
                    );

                    this.chunk[blockPos.toString()] = new Cube({
                        angle: new Vector3(
                            0,//this.rotations.x/360*2*Math.PI,
                            0,//this.rotations.y/360*2*Math.PI,
                            0,//this.rotations.z/360*2*Math.PI
                        ),
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
        /*this.cube.coordinates = this.pos;
        this.cube.size = this.distance;
        this.cube.angle = this.rotations;*/
        const blockVertexes: number[][] = []
        for(const block in this.chunk) {
            blockVertexes.push(this.chunk[block].toVertexes())
        }

        return blockVertexes;
    }

    public attachControls(controllers: controllerAssign) {
        controllers.posX?.attach((value) => { this.pos.x = value/800})
        controllers.posY?.attach((value) => {this.pos.y = value/600})
        controllers.posZ?.attach((value) => {this.pos.z = value/800})
        controllers.rotateX?.attach((value) => {this.rotations.x = value/360*2*Math.PI})
        controllers.rotateY?.attach((value) => {this.rotations.y = value/360*2*Math.PI})
        controllers.rotateZ?.attach((value) => {this.rotations.z = value/360*2*Math.PI})
        //controllers.distance?.attach((value) => {this.distance = value})
    }
}
