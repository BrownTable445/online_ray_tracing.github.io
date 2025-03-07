import * as vec3 from './vec3.js'
import * as ray from './ray.js'

export class material {
    scatter(r_in, rec, attenuation, scattered) {
        return false
    }
}

export class lambertian extends material {
    constructor(albedo) {
        super()
        this.albedo = albedo
    }

    scatter(r_in, rec, attenuation, scattered) {
        const scatter_direction = vec3.add(rec.normal, vec3.random_unit_vector())

        if (scatter_direction.near_zero()) {
            scatter_direction = rec.normal
        }

        Object.assign(scattered, new ray.ray(rec.p, scatter_direction))
        Object.assign(attenuation, this.albedo)
        return true
    }
}

export class metal extends material {
    constructor(albedo) {
        super()
        this.albedo = albedo
    }

    scatter(r_in, rec, attenuation, scattered) {
        const reflected = vec3.reflect(r_in.dir, rec.normal)
        
        Object.assign(scattered, new ray.ray(rec.p, reflected))
        Object.assign(attenuation, this.albedo)
        return true
    }
}

export class diaelectric extends material {
    constructor(refraction_index) {
        super()
        this.refraction_index = refraction_index
    }

    scatter(r_in, rec, attenuation, scattered) {
        Object.assign(attenuation, new vec3.vec3(1, 1, 1))

        const ri = rec.front_face ? 1 / this.refraction_index : this.refraction_index

        const unit_direction = vec3.unit_vector(r_in.dir)
        const cos_theta = Math.min(vec3.dot(unit_direction.negate(), rec.normal), 1)
        const sin_theta = Math.sqrt(1 - cos_theta * cos_theta)

        const cannot_refract = ri * sin_theta > 1
        let direction = new vec3.vec3()

        if (cannot_refract) {
            direction = vec3.reflect(unit_direction, rec.normal)
        } else {
            direction = vec3.refract(unit_direction, rec.normal, ri)
        }

        Object.assign(scattered, new ray.ray(rec.p, direction))
        return true
    }
}