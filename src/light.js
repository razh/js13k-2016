import { color_create } from './color';
import { object3d_create } from './object3d';

export function light_create(color, intensity) {
  return Object.assign(
    object3d_create(),
    {
      color: color || color_create(),
      intensity: intensity !== undefined ? intensity : 1,
    }
  );
}
