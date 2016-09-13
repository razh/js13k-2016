import { object3d_create } from './object3d';
import { vec3_create, vec3_Y } from './vec3';

export function directionalLight_create(color, intensity) {
  var light = Object.assign(
    object3d_create(),
    {
      color: color || vec3_create(),
      intensity: intensity !== undefined ? intensity : 1,
      target: object3d_create(),
    }
  );

  Object.assign(light.position, vec3_Y);
  return light;
}
