import { boxGeom_create } from './boxGeom';
import { material_create } from './material';
import { mesh_create } from './mesh';
import { object3d_create, object3d_add } from './object3d';
import { quat_setFromEuler } from './quat';
import { vec3_create } from './vec3';

export function worm_create(count, width, height, depth, separation) {
  var worm = object3d_create();
  var material = material_create();

  for (var i = 0; i < count; i++) {
    var geometry = boxGeom_create(width, height, depth);
    var mesh = mesh_create(geometry, material);
    mesh.position.z = (depth / 2) + (depth + separation) * i;
    quat_setFromEuler(mesh.quaternion, vec3_create(0, 0, Math.PI / 4));
    object3d_add(worm, mesh);
  }

  return worm;
}
