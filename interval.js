export class interval {
    constructor(min, max) {
        if (min === undefined && max === undefined) {
            this.min = Infinity
            this.max = -Infinity
        } else {
            this.min = min
            this.max = max
        }
    }

    size() {
        return this.max - this.min
    }

    contains(x) {
        return this.min <= x && x <= this.max
    }

    surrounds(x) {
        return this.min < x && x < this.max
    }

    clamp(x) {
        if (x < this.min) {
            return this.min
        }
        if (x > this.max) {
            return this.max
        }
        return x
    }

    static empty = new interval(Infinity, -Infinity)
    static universe = new interval(-Infinity, Infinity)
}