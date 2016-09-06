import { light_create } from './light';
import { object3d_create } from './object3d';
import { vec3_Y } from './vec3';

export function directionalLight_create(color, intensity) {
  var light = Object.assign(
    light_create(color, intensity),
    {
      target: object3d_create(),
    }
  );

  Object.assign(light.position, vec3_Y);
  return light;
}
