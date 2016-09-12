export function lerp(a, b, t) {
  return a + t * (b - a);
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function randFloat(low, high) {
  return low + Math.random() * (high - low);
}

export function randFloatSpread(range) {
  return range * (0.5 - Math.random());
}

export function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}
