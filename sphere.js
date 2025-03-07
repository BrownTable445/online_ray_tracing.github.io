import * as vec3 from './vec3.js'
import * as hittable from './hittable.js'
import * as material from './material.js'

export class sphere extends hittable.hittable {
    constructor(center, radius, mat) {
        super()
        this.center = center
        this.radius = Math.max(0, radius)
        this.mat = mat
    }

    hit(r, ray_t, rec) {
        const oc = vec3.subtract(this.center, r.origin)
        const a = r.dir.length_squared()
        const h = vec3.dot(r.dir, oc)
        const c = oc.length_squared() - this.radius * this.radius

        const discriminant = h * h - a * c
        if (discriminant < 0) {
            return false
        }

        const sqrtd = Math.sqrt(discriminant)

        let root = (h - sqrtd) / a
        if (!ray_t.surrounds(root)) {
            root = (h + sqrtd) / a
            if (!ray_t.surrounds(root)) {
                return false
            }
        }

        rec.t = root
        rec.p = r.at(rec.t)
        const outward_normal = vec3.divide_constant(this.radius, vec3.subtract(rec.p, this.center))
        rec.set_face_normal(r, outward_normal)
        rec.mat = this.mat

        return true
    }
}