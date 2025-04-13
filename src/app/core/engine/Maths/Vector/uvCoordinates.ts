export class UvCoordinates {

    constructor(
        public u: number,
        public v: number
    ) {
    }

    public scale(s: number) {
        this.u = s * this.u;
        this.v = s * this.v;
    }

    public toArray(): [number, number] {
        return [this.u, this.v];
    }

    public copy(): UvCoordinates {
        return UvCoordinates.fromArray(this.toArray());
    }

    public add(vector: UvCoordinates): UvCoordinates {
        this.u += vector.u;
        this.v += vector.v;

        return this;
    }

    public multiply(vector: UvCoordinates): UvCoordinates {
        this.u *= vector.u;
        this.v *= vector.v;

        return this;
    }

    public divide(vector: UvCoordinates): UvCoordinates {
        this.u /= vector.u;
        this.v /= vector.v;

        return this;
    }

    static fromArray(array: [number, number]): UvCoordinates {
        return new this(...array);
    }

    public toString(): string {
        return `${this.u},${this.v}`;
    }
}
