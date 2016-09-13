import { boxGeom_create } from './boxGeom';
import { geom_merge } from './geom';
import { material_create } from './material';
import { mesh_create } from './mesh';
import { object3d_create, object3d_add, object3d_rotateZ } from './object3d';
import { vec3_set } from './vec3';
import { BODY_STATIC, physics_create } from './physics';
import { align } from './boxAlign';
import { scaleVertices } from './boxTransform';
import { compose } from './utils';

export function worm_create(count, width, height, depth, separation) {
  var worm = object3d_create();
  var material = material_create();
  vec3_set(material.specular, 1, 1, 1);

  var halfDepth = depth / 2;

  var geometry = geom_merge(
    // Front.
    compose(
      align('nz'),
      scaleVertices({ nz: 0.5 }),
      align('pz')
    )(boxGeom_create(width, height, halfDepth)),

    // Back.
    compose(
      align('pz'),
      scaleVertices({ pz: 0.5 }),
      align('nz')
    )(boxGeom_create(width, height, halfDepth))
  );

  for (var i = 0; i < count; i++) {
    var mesh = mesh_create(geometry, material);
    physics_create(mesh, BODY_STATIC);
    mesh.position.z = (depth / 2) + (depth + separation) * i;
    object3d_rotateZ(mesh, Math.PI / 4);
    object3d_add(worm, mesh);
  }

  return worm;
}
