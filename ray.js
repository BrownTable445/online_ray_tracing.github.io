import * as vec3 from './vec3.js'

export class ray {
    constructor(origin, direction) {
        this.origin = origin
        this.dir = direction
    }

    at(t) {
        return vec3.add(this.origin, vec3.multiply_constant(t, this.dir))
    }
}