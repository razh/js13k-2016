import { boxGeom_create } from './boxGeom';
import { geom_merge } from './geom';
import { material_create } from './material';
import { mesh_create } from './mesh';
import { object3d_create, object3d_add } from './object3d';
import { quat_setFromEuler } from './quat';
import { vec3_create, vec3_set } from './vec3';
import { align } from './boxAlign';
import { scaleVertices } from './boxTransform';
import { compose } from './utils';

export function worm_create(count, width, height, depth, separation) {
  var worm = object3d_create();
  var material = material_create();
  vec3_set(material.specular, 1, 1, 1);

  var halfDepth = depth / 2;

  var frontGeometry = boxGeom_create(width, height, halfDepth);
  compose(
    align('nz'),
    scaleVertices({ nz: 0.5 }),
    align('pz')
  )(frontGeometry);

  var backGeometry = boxGeom_create(width, height, halfDepth);
  compose(
    align('pz'),
    scaleVertices({ pz: 0.5 }),
    align('nz')
  )(backGeometry);

  geom_merge(frontGeometry, backGeometry);

  for (var i = 0; i < count; i++) {
    var mesh = mesh_create(frontGeometry, material);
    mesh.position.z = (depth / 2) + (depth + separation) * i;
    quat_setFromEuler(mesh.quaternion, vec3_create(0, 0, Math.PI / 4));
    object3d_add(worm, mesh);
  }

  return worm;
}
