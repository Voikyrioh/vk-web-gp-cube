import {Chunk} from "./Chunk.ts";
import {Cube, Side} from "../Cube.ts";
import {GameMap} from "../GameMap.ts";

export class ChunkRenderer {

    blockNumber = 0;
    vertexesCount = 0;
    cubesVertexes: Iterator<Cube>;
    done = false;

    constructor(chunk: &Chunk) {
        this.cubesVertexes = chunk.getChunkCubes();
    }


    nextRender(map: &GameMap): Promise<Float32Array> {
        return new Promise(resolve => {
            this.vertexesCount = 0;
            const vertexesBuffer: number[] = [];
            do {
                const cube: Cube = this.cubesVertexes.next()?.value;
                if (!cube) {
                    this.done = true;
                    break;
                }

                const pos = cube.coordinates;
                if (map.getLoadedBlockByPosition(pos.x, pos.y, pos.z + 1)) cube.setObfuscatedFace(Side.FACE);
                if (map.getLoadedBlockByPosition(pos.x, pos.y, pos.z - 1)) cube.setObfuscatedFace(Side.BACK);
                if (map.getLoadedBlockByPosition(pos.x, pos.y + 1, pos.z)) cube.setObfuscatedFace(Side.TOP);
                if (map.getLoadedBlockByPosition(pos.x, pos.y - 1, pos.z)) cube.setObfuscatedFace(Side.BOTTOM);
                if (map.getLoadedBlockByPosition(pos.x + 1, pos.y, pos.z)) cube.setObfuscatedFace(Side.RIGHT);
                if (map.getLoadedBlockByPosition(pos.x - 1, pos.y, pos.z)) cube.setObfuscatedFace(Side.LEFT);

                const blockVertexes = cube.toVertexes();
                this.vertexesCount += blockVertexes.length;
                vertexesBuffer.push(...blockVertexes.flat(1));
                this.blockNumber++;
            } while (this.blockNumber % 16 !== 0 && !this.done);

            resolve(new Float32Array(vertexesBuffer));
        })
    }
}
