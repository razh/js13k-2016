import { vec3_create } from './vec3';

export function face3_create(a, b, c) {
  return {
    a: a,
    b: b,
    c: c,
    color: vec3_create(1, 1, 1),
    vertexColors: [],
  };
}
