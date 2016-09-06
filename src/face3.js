import { color_create } from './color';

export function face3_create(a, b, c) {
  return {
    a: a,
    b: b,
    c: c,
    color: color_create(1, 1, 1),
    vertexColors: [],
  };
}
