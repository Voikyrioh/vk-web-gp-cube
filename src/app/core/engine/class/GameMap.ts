import {Chunk} from "./Chunk/Chunk.ts";
import {Cube} from "./Cube.ts";
import {Vector3} from "../Maths/Vector/Vector3.ts";

export class GameMap {
    #loadedChunks = new Map<number, Chunk>();
    constructor() {
        this.#loadedChunks.set(0, Chunk.generateChunk(new Vector3(0,0,0)));
    }

    static getChunkReference(x: number,z: number): number {
        return (x<<16)|z;
    }

    static getChunkPos(reference: number): [number,number] {
        return [reference >> 16, reference & 65535];
    }

    getLoadedBlockByPosition(x: number, y: number, z: number): &Cube|undefined {
        if (y>15) return;
        const estimatedChunk = this.#loadedChunks.get(GameMap.getChunkReference(Math.trunc(x/16),Math.trunc(z/16)));
        if (!estimatedChunk) return;
        const chunkpos = Chunk.getPosValue([x - estimatedChunk.pos.x, y - estimatedChunk.pos.y, z - estimatedChunk.pos.z]);

        return estimatedChunk.getCube(chunkpos);
    }

    getChunk(): &Chunk | undefined {
        return this.#loadedChunks.get(GameMap.getChunkReference(0,0));
    }

    getChunks(): Iterable<Chunk> {
        return this.#loadedChunks.values();
    }
}
