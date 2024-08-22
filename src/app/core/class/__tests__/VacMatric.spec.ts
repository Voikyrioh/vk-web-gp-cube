import {VecMatrix} from "../VecMatrix.ts";
import {expect} from "chai";

describe('[unit] VecMatrix Class', () => {
    describe('Constructor', () => {
        it('Should create VecMatrix from MatrixArray', () => {
            expect(VecMatrix).to.be.a('function');
            const myMatrix = new VecMatrix([
                1,   2,  3,  4,
                5,   6,  7,  8,
                9,  10, 11, 12,
                13, 14, 15, 16
            ]);
            expect(myMatrix).to.not.be.undefined;
            expect(myMatrix.getMatrix()).to.be.a('array').that.deep.equal([
                1,   2,  3,  4,
                5,   6,  7,  8,
                9,  10, 11, 12,
                13, 14, 15, 16
            ]);
        })

        it('Should set correct values into rows and columns', () => {
            const myMatrix = new VecMatrix([
                1,   2,  3,  4,
                5,   6,  7,  8,
                9,  10, 11, 12,
                13, 14, 15, 16
            ]);

            expect(myMatrix.rows).to.have.lengthOf(4).and.to.be.deep.equal([
                [1,   2,  3,  4],
                [5,   6,  7,  8],
                [9,  10, 11, 12],
                [13, 14, 15, 16]
            ]);

            expect(myMatrix.columns).to.have.lengthOf(4).and.to.be.deep.equal([
                [ 1, 5,  9, 13 ],
                [ 2, 6, 10, 14 ],
                [ 3, 7, 11, 15 ],
                [ 4, 8, 12, 16 ]
            ]);
        })
    });

    describe('Multiply()', () => {
        it('should multiply correctly two MatrixArrays', () => {
            expect(VecMatrix.multiply([
                    1,   2,  3,  4,
                    5,   6,  7,  8,
                    9,  10, 11, 12,
                    13, 14, 15, 16
                ],[
                    16, 15, 14, 13,
                    12, 11, 10,  9,
                    8,  7,  6,  5,
                    4,  3,  2,  1
                ])
            ).to.be.a('array').that.deep.equal([
                386, 444, 502, 560,
                274, 316, 358, 400,
                162, 188, 214, 240,
                50, 60, 70, 80
            ]);
        });
    });
});
