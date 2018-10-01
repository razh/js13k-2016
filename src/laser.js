import { boxGeom_create } from './boxGeom.js';
import { material_create } from './material.js';
import { mesh_create } from './mesh.js';

export function laser_create(color) {
  var laserMaterial = material_create();
  if (color) {
    Object.assign(laserMaterial.emissive, color);
  }

  return mesh_create(
    boxGeom_create(0.05, 0.05, 0.5),
    laserMaterial
  );
}
