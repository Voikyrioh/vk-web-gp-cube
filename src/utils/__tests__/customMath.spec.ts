import { rotationReset, clamp } from "../customMath";
import {expect} from "chai";

describe('[unit] CustomMath', () => {
    describe('clamp()', () => {
        it('should return value if value is in clamp', () => {
            expect(clamp(12, 3, 20)).to.be.equal(12);
        })
        it('should return max if value is greater than max', () => {
            expect(clamp(22, 3, 20)).to.be.equal(20);
        })
        it('should return min if value is lesser than min', () => {
            expect(clamp(1, 3, 20)).to.be.equal(3);
        })
    })
    describe('rotationReset()', () => {
        it('should return value if value less than full turn', () => {
            expect(rotationReset(1.5 * Math.PI)).to.be.equal(1.5 * Math.PI);
        })
        it('should return value without useless full turn if more than one turn', () => {
            expect(Math.round(rotationReset(10.5 * Math.PI )* 10000)/ 10000).to.be.equal(Math.round(.5 * Math.PI * 10000)/ 10000);
        })
        it('should return negative value too', () => {
            expect(Math.round(rotationReset(10.5 * Math.PI * -1)* 10000)/ 10000).to.be.equal(Math.round(.5 * Math.PI * -1 * 10000)/ 10000);
        })
    })
});
