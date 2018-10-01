import { object3d_create } from './object3d.js';

export function mesh_create(geometry, material) {
  return Object.assign(
    object3d_create(),
    {
      geometry: geometry,
      material: material,
    }
  );
}
