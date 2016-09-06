import { object3d_create } from './object3d';
import { vec3_create } from './vec3';

export function light_create(color, intensity) {
  return Object.assign(
    object3d_create(),
    {
      color: color || vec3_create(),
      intensity: intensity !== undefined ? intensity : 1,
    }
  );
}
