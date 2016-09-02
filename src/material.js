import { color_create } from './color';

// MeshPhongMaterial.
export function material_create() {
  return {
    color: color_create(1, 1, 1),
    // 0x111111
    specular: color_create(1 / 15, 1 / 15, 1 / 15),
    shininess: 30,
    emissive: color_create(),
    emissiveIntensity: 1,
  };
}
