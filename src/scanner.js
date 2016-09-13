import { boxGeom_create } from './boxGeom';
import { geom_merge, translate } from './geom';
import { material_create } from './material';
import { mesh_create } from './mesh';
import { object3d_create, object3d_add } from './object3d';
import { quat_setFromEuler } from './quat';
import{ vec3_create, vec3_set } from './vec3';
import { BODY_DYNAMIC, physics_create } from './physics';
import { align } from './boxAlign';
import { colors, defaultColors } from './boxColors';
import { translateVertices } from './boxTransform';
import { compose } from './utils';

var armGeometry = geom_merge(
  compose(
    align('pz'),
    defaultColors([1, 1, 1]),
    colors({ ny: [0.5, 0.5, 0.5] }),
    translateVertices({
      // Higher back.
      nz: { y: 1 },
      // Pointier back.
      ny_nz: { y: 0.25, z: 0.25 },
      // Shrink along x-axis.
      nx_nz: { x: 0.25 },
      px_nz: { x: -0.25 },
    })
  )(boxGeom_create(0.5, 0.5, 2)),

  compose(
    align('nz'),
    defaultColors([1, 1, 1]),
    colors({ ny: [0.5, 0.5, 0.5] }),
    translateVertices({
      // Smaller front.
      // Shrink along x-axis.
      nx_pz: { x: 0.15 },
      px_pz: { x: -0.15 },
      // Shrink along y-axis.
      py_pz: { y: -0.3 },
      ny_pz: { y: 0.05 },
    })
  )(boxGeom_create(0.5, 0.5, 0.375))
);

armGeometry = translate(0, 0.5, 0)(armGeometry);

var armRotation = vec3_create();
var material = material_create();

export function scanner_create() {
  var scanner = object3d_create();

  var topArm = mesh_create(armGeometry, material);
  var leftArm = mesh_create(armGeometry, material);
  var rightArm = mesh_create(armGeometry, material);

  var angle = 2 * Math.PI / 3;
  quat_setFromEuler(leftArm.quaternion, vec3_set(armRotation, 0, 0, -angle));
  quat_setFromEuler(rightArm.quaternion, vec3_set(armRotation, 0, 0, angle));

  object3d_add(scanner, topArm);
  object3d_add(scanner, leftArm);
  object3d_add(scanner, rightArm);

  physics_create(scanner, BODY_DYNAMIC);

  return scanner;
}
