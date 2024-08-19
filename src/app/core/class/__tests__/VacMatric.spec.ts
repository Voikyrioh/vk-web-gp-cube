import {VecMatrix} from "../VecMatrix.ts";
import {expect} from "chai";

describe('[unit] VecMatrix Class', () => {
    describe('Constructor', () => {
        it('Should create VecMatrix from MatrixArray', () => {
            expect(VecMatrix).to.be.a('function');
            const myMatrix = new VecMatrix([
                2,3,1,
                0,4,3,
                1,4,2
            ]);
            expect(myMatrix).to.not.be.undefined;
            expect(myMatrix.getMatrix()).to.be.a('array').that.deep.equal([
                2,3,1,
                0,4,3,
                1,4,2
            ]);
        })

        it('Should set correct values into rows and columns', () => {
            const myMatrix = new VecMatrix([
                1,2,3,
                4,5,6,
                7,8,9
            ]);

            expect(myMatrix.rows).to.have.lengthOf(3).and.to.be.deep.equal([
                [1,2,3],
                [4,5,6],
                [7,8,9],
            ]);

            expect(myMatrix.columns).to.have.lengthOf(3).and.to.be.deep.equal([
                [1,4,7],
                [2,5,8],
                [3,6,9],
            ]);
        })
    });

    describe('Multiply()', () => {
        it('should multiply correctly two MatrixArrays', () => {
            expect(VecMatrix.multiply(
                [
                    2,3,1,
                    0,4,3,
                    1,4,2
                ],[
                    1,0,2,
                    0,1,3,
                    3,4,3
                ])
            ).to.be.a('array').that.deep.equal([
                    4,11,5,
                    3,16,9,
                    9,37,21
            ]);
        });
    });
});
