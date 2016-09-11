import { boxGeom_create } from './boxGeom';
import { material_create } from './material';
import { mesh_create } from './mesh';

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
