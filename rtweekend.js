export function degrees_to_radians(degrees) {
  return degrees * Math.PI / 180.0;
}

export function random_double(min, max) {
    // Returns a random real in [min, max).
    if (min === undefined) {
        return Math.random()
    }
    return min + (max - min) * Math.random();
}
