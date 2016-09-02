import { light_create } from './light';
import { object3d_create } from './object3d';
import { vec3_copy, vec3_Y } from './vec3';

export function directionalLight_create(color, intensity) {
  const light = Object.assign(
    light_create(color, intensity),
    {
      target: object3d_create(),
    }
  );

  vec3_copy(light.position, vec3_Y);
  return light;
}
