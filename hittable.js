import * as vec3 from './vec3.js'
import * as interval from './interval.js'
import * as material from './material.js'

export class hit_record {
    p = new vec3.vec3()
    normal = new vec3.vec3()
    mat = new material.material()
    t = 0
    front_face = false

    set_face_normal(r, outward_normal) {
        this.front_face = vec3.dot(r.dir, outward_normal) < 0
        this.normal = this.front_face ? outward_normal : outward_normal.negate()
    }
}

export class hittable {
    hit(r, ray_t, rec) {}
}

export class hittable_list extends hittable {
    objects = []

    constructor(object) {
        super()
        if (object instanceof hittable) {
            this.add(object)
        }
    }

    clear() {
        this.objects = []
    }

    add(object) {
        this.objects.push(object)
    }

    hit(r, ray_t, rec) {
        let temp_rec = new hit_record()
        let hit_anything = false
        let closest_so_far = ray_t.max

        for (const object of this.objects) {
            if (object.hit(r, new interval.interval(ray_t.min, closest_so_far), temp_rec)) {
                hit_anything = true
                closest_so_far = temp_rec.t
                Object.assign(rec, temp_rec)
            }
        }

        return hit_anything
    }
}