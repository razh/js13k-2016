import { light_create } from './light';
import { vec3_copy, vec3_Y } from './vec3';

export function directionalLight_create(color, intensity) {
  const light = light_create(color, intensity);
  vec3_copy(light.position, vec3_Y);
  return light;
}
