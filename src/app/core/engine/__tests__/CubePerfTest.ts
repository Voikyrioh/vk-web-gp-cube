import {_Cube} from "../class/_Cube.ts";
import {Cube} from "../class/Cube.ts";
import {Vector3} from "../Maths/Vector/Vector3.ts";
import {expect} from "chai";

describe('CubePerfTest', () => {
    describe('performances', () => {

    })
    describe('Result', () => {
        it('should have same vertexes than  _Cube', () => {
            const old = new _Cube({
                coordinates: new Vector3(0,0,0)
            }).toFaceVertexes();

            const newCube = Cube.create(new Vector3(0,0,0)).toVertexes();

            expect(newCube.flat(1).length).to.be.deep.equal(5);
            expect(old[0]).to.be.deep.equal(5);
            expect(newCube.flat(1)).to.be.deep.equal(old);
            expect(newCube.flat(1)).to.be.deep.equal(old.flat(1));
        });
    })
})
