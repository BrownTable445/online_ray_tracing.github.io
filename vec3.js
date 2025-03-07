import * as rtweekend from './rtweekend.js'
export class vec3 {
    constructor(e1 = 0, e2 = 0, e3 = 0) {
        this.e = [e1, e2, e3]
    }

    x() {
        return this.e[0]
    }

    y() {
        return this.e[1]
    }

    z() {
        return this.e[2]
    }

    negate() {
        return new vec3(-this.e[0], -this.e[1], -this.e[2])
    }

    add(v) {
        this.e[0] += v.e[0]
        this.e[1] += v.e[1]
        this.e[2] += v.e[2]
        return this
    }

    multiply(t) {
        this.e[0] *= t
        this.e[1] *= t
        this.e[2] *= t
        return this
    }

    divide(t) {
        return this.multiply(1 / t)
    }

    length() {
        return Math.sqrt(this.length_squared())
    }

    length_squared() {
        return this.e[0] * this.e[0] + this.e[1] * this.e[1] + this.e[2] * this.e[2]
    }

    near_zero() {
        const s = 1e-8
        return (Math.abs(this.e[0]) < s && Math.abs(this.e[1] < s) && Math.abs(this.e[2] < s))
    }

    static random() {
        return new vec3(rtweekend.random_double(), rtweekend.random_double(), rtweekend.random_double())
    }

    static random(min, max) {
        return new vec3(rtweekend.random_double(min, max), rtweekend.random_double(min, max), rtweekend.random_double(min, max))
    }
}

export function add(u, v) {
    return new vec3(u.e[0] + v.e[0], u.e[1] + v.e[1], u.e[2] + v.e[2])
}

export function subtract(u, v) {
    return new vec3(u.e[0] - v.e[0], u.e[1] - v.e[1], u.e[2] - v.e[2])
}

export function multiply(u, v) {
    return new vec3(u.e[0] * v.e[0], u.e[1] * v.e[1], u.e[2] * v.e[2])
}

export function multiply_constant(t, v) {
    return new vec3(t * v.e[0], t * v.e[1], t * v.e[2])
}

export function divide_constant(t, v) {
    return multiply_constant(1 / t, v)
}

export function dot(u, v) {
    return u.e[0] * v.e[0] + u.e[1] * v.e[1] + u.e[2] * v.e[2]
}

export function cross(u, v) {
    return new vec3(u.e[1] * v.e[2] - u.e[2] * v.e[1], u.e[2] * v.e[0] - u.e[0] * v.e[2], u.e[0] * v.e[1] - u.e[1] * v.e[0])
}

export function unit_vector(v) {
    return divide_constant(v.length(), v)
}

export function random_in_unit_disk() {
    while (true) {
        const p = new vec3(rtweekend.random_double(-1, 1), rtweekend.random_double(-1, 1), 0)
        if (p.length_squared() < 1) {
            return p
        }
    }
}

export function random_unit_vector() {
    while (true) {
        const p = vec3.random(-1, 1)
        const lensq = p.length_squared()
        if (1e-160 < lensq && lensq <= 1) {
            return divide_constant(Math.sqrt(lensq), p)
        }
    }
}

export function random_on_hemisphere(normal) {
    const on_unit_sphere = random_unit_vector()
    if (dot(on_unit_sphere, normal) > 0) {
        return on_unit_sphere
    } else {
        return on_unit_sphere.negate()
    }
}

export function reflect(v, n) {
    return subtract(v, multiply_constant(2 * dot(v, n), n))
}

export function refract(uv, n, etai_over_etat) {
    const cos_theta = Math.min(dot(uv.negate(), n), 1)
    const r_out_perp = multiply_constant(etai_over_etat, add(uv, multiply_constant(cos_theta, n)))
    const r_out_paralllel = multiply_constant(-Math.sqrt(Math.abs(1 - r_out_perp.length_squared())), n)
    return add(r_out_perp, r_out_paralllel)
}