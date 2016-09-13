import { vec3_create, vec3_clone } from './vec3';

export function face3_create(a, b, c) {
  return {
    a: a,
    b: b,
    c: c,
    color: vec3_create(1, 1, 1),
    vertexColors: [],
  };
}

export function face3_clone(face) {
  return {
    a: face.a,
    b: face.b,
    c: face.c,
    color: vec3_clone(face.color),
    vertexColors: face.vertexColors.map(vec3_clone),
  };
}
