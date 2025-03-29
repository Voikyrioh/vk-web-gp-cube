import {Chunk} from "./Chunk.ts";
import {Cube} from "../Cube.ts";

export class ChunkRenderer {

    blockNumber = 0;
    vertexesCount = 0;
    cubesVertexes: Iterator<Cube>;
    done = false;

    constructor(chunk: Chunk) {
        this.cubesVertexes = chunk.getChunkCubes();
    }

    nextRender(): Promise<Float32Array> {
        return new Promise(resolve => {
            this.vertexesCount = 0;
            const vertexesBuffer: number[] = [];
            do {
                const next = this.cubesVertexes.next();
                if (!next.value) {
                    this.done = true;
                    break;
                }
                const blockVertexes = next.value.toVertexes();
                this.vertexesCount += blockVertexes.length;
                vertexesBuffer.push(...blockVertexes.flat(1));
                this.blockNumber++;
            } while (this.blockNumber % 16 !== 0 && !this.done);

            resolve(new Float32Array(vertexesBuffer));
        })
    }
}
