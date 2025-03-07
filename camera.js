import * as vec3 from './vec3.js'
import * as ray from './ray.js'
import * as hittable from './hittable.js'
import * as sphere from './sphere.js'
import * as interval from './interval.js'
import * as rtweekend from './rtweekend.js'

export class camera {
    canvas = document.getElementById('raytracer');

    aspect_ratio = 16 / 9
    samples_per_pixel = 10
    max_dpeth = 10
    vfov = 90
    lookfrom = new vec3.vec3(0, 0, 0)
    lookat = new vec3.vec3(0, 0, -1)
    vup = new vec3.vec3(0, 1, 0)

    defocus_angle = 0
    focus_dist = 10

    async render(world) {
        this.initialize()

        const ctx = this.canvas.getContext('2d');
        
        // Image data for the full canvas
        const imageData = ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;

        // Process pixels in chunks and update the display periodically
        const updateFrequency = 10; // Update the canvas every 10 rows
        
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                let pixel_color = new vec3.vec3(0, 0, 0)
                for (let sample = 0; sample < this.samples_per_pixel; sample++) {
                    const r = this.get_ray(x, y)
                    pixel_color.add(this.ray_color(r, this.max_dpeth, world))
                }
                pixel_color.multiply(this.pixel_samples_scale)
                
                const index = (y * this.canvas.width + x) * 4;

                let r = pixel_color.x()
                let g = pixel_color.y()
                let b = pixel_color.z()

                r = this.linear_to_gamma(r)
                g = this.linear_to_gamma(g)
                b = this.linear_to_gamma(b)

                const intensity = new interval.interval(0, 0.999)
                data[index] = 256 * intensity.clamp(r)
                data[index + 1] = 256 * intensity.clamp(g)
                data[index + 2] = 256 * intensity.clamp(b)
                data[index + 3] = 255
            }
            
            // Update the canvas after each row or after updateFrequency rows
            if (y % updateFrequency === 0 || y === this.canvas.height - 1) {
                ctx.putImageData(imageData, 0, 0);
                // Allow the UI to update by yielding execution
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
    }

    initialize() {
        this.canvas.height = this.canvas.width / this.aspect_ratio
        this.canvas.height = (this.canvas.height < 1) ? 1 : this.canvas.height

        this.pixel_samples_scale = 1 / this.samples_per_pixel

        this.center = this.lookfrom

        const theta = rtweekend.degrees_to_radians(this.vfov)
        const h = Math.tan(theta / 2)
        const viewport_height = 2 * h * this.focus_dist
        const viewport_width = viewport_height * (this.canvas.width / this.canvas.height)

        this.w = vec3.unit_vector(this.lookfrom, this.lookat)
        this.u = vec3.unit_vector(vec3.cross(this.vup, this.w))
        this.v = vec3.cross(this.w, this.u)

        const viewport_u = vec3.multiply_constant(viewport_width, this.u)
        const viewport_v = vec3.multiply_constant(viewport_height, this.v.negate())

        this.pixel_delta_u = vec3.divide_constant(this.canvas.width, viewport_u)
        this.pixel_delta_v = vec3.divide_constant(this.canvas.height, viewport_v)

        this.viewport_upper_left = vec3.subtract(vec3.subtract(vec3.subtract(this.center, vec3.multiply_constant(this.focus_dist, this.w)), vec3.divide_constant(2, viewport_u)), vec3.divide_constant(2, viewport_v))
        this.pixel00_loc = vec3.add(this.viewport_upper_left, vec3.multiply_constant(0.5, vec3.add(this.pixel_delta_u, this.pixel_delta_v)))

        const defocus_radius = this.focus_dist * Math.tan(rtweekend.degrees_to_radians(this.defocus_angle / 2))
        this.defocus_disk_u = vec3.multiply_constant(defocus_radius, this.u)
        this.defocus_disk_v = vec3.multiply_constant(defocus_radius, this.v)
    }

    get_ray(i, j) {
        const offset = this.sample_square()
        const pixel_sample = vec3.add(vec3.add(this.pixel00_loc, vec3.multiply_constant(i + offset.x(), this.pixel_delta_u)), vec3.multiply_constant(j + offset.y(), this.pixel_delta_v))
        const ray_origin = (this.defocus_angle <= 0) ? this.center : this.defocus_disk_sample()
        const ray_direction = vec3.subtract(pixel_sample, ray_origin)
        return new ray.ray(ray_origin, ray_direction)
    }

    sample_square() {
        return new vec3.vec3(rtweekend.random_double() - 0.5, rtweekend.random_double() - 0.5, 0)
    }

    defocus_disk_sample() {
        const p = vec3.random_in_unit_disk()
        return vec3.add(vec3.add(this.center, vec3.multiply_constant(p.e[0], this.defocus_disk_u)), vec3.multiply_constant(p.e[1], this.defocus_disk_v))
    }

    ray_color(r, depth, world) {
        if (depth <= 0) {
            return new vec3.vec3(0, 0, 0)
        }

        let rec = new hittable.hit_record()
        if (world.hit(r, new interval.interval(0.001, Infinity), rec)) {
            let scattered = new ray.ray()
            let attenuation = new vec3.vec3()
            if (rec.mat.scatter(r, rec, attenuation, scattered)) {
                return vec3.multiply(attenuation, this.ray_color(scattered, depth - 1, world))
            }
            return new vec3.vec3(0, 0, 0)
        }
  
        const unit_direction = vec3.unit_vector(r.dir)
        const a = 0.5 * (unit_direction.y() + 1)
        return vec3.add(vec3.multiply_constant((1 - a), new vec3.vec3(1, 1, 1)), vec3.multiply_constant(a, new vec3.vec3(0.5, 0.7, 1)))
    }

    linear_to_gamma(linear_component) {
        if (linear_component > 0) {
            return Math.sqrt(linear_component)
        }
        return 0;
    }
}