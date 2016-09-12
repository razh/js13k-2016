import { boxGeom_create } from './boxGeom';
import { geom_flipFaces, translate, scale } from './geom';
import { material_create } from './material';
import { mesh_create } from './mesh';
import { object3d_create, object3d_add } from './object3d';
import { quat_setFromEuler } from './quat';
import{ vec3_create, vec3_set } from './vec3';
import { BODY_DYNAMIC, physics_create } from './physics';
import { align } from './boxAlign';
import { translateVertices, scaleVertices } from './boxTransform';
import { compose } from './utils';

var invertX = scale(-1, 1, 1);

function createWingGeometry() {
  return compose(
    align('nx_pz'),
    translateVertices({
      px: { z: 0.5 },
      px_nz: { z: 0.5 },
    }),
    scaleVertices({ px: [1, 0, 1] })
  )(boxGeom_create(2, 0.2, 1));
}

var leftWingGeometry = createWingGeometry();
var rightWingGeometry = geom_flipFaces(invertX(createWingGeometry()));

function createBodyGeometry() {
  return compose(
    align('nx'),
    translate(0, 0, -0.2),
    translateVertices({
      px_nz: { z: 0.6 },
      nx_pz: { z: 0.2 },
      nx_py_pz: { y: 0.1 },
    })
  )(boxGeom_create(0.5, 0.2, 1.2));
}

var leftBodyGeometry = createBodyGeometry();
var rightBodyGeometry = geom_flipFaces(invertX(createBodyGeometry()));

function createPincerGeometry() {
  return compose(
    align('nx_nz'),
    // translate(0.2, 0, 0.2),
    translate(0, 0, 0.4),
    translateVertices({
      px_pz: { z: -0.5 },
    }),
    scaleVertices({
      pz: [1, 0.2, 1],
    })
  )(boxGeom_create(0.3, 0.2, 0.7));
}

var leftPincerGeometry = createPincerGeometry();
var rightPincerGeometry = geom_flipFaces(invertX(createPincerGeometry()));

var material = material_create();

export function scanner_create() {
  var scanner = object3d_create();

  var leftWing = mesh_create(leftWingGeometry, material);
  var rightWing = mesh_create(rightWingGeometry, material);

  var leftBody = mesh_create(leftBodyGeometry, material);
  var rightBody = mesh_create(rightBodyGeometry, material);

  var leftPincer = mesh_create(leftPincerGeometry, material);
  var rightPincer = mesh_create(rightPincerGeometry, material);

  object3d_add(scanner, leftWing);
  object3d_add(scanner, rightWing);

  object3d_add(scanner, leftBody);
  object3d_add(scanner, rightBody);

  object3d_add(scanner, leftPincer);
  object3d_add(scanner, rightPincer);

  physics_create(scanner, BODY_DYNAMIC);

  var leftWingRotation = vec3_create();
  var rightWingRotation = vec3_create();

  var t = 0;

  scanner.update = function(dt) {
    t += dt;

    var angle = Math.PI / 36 * Math.cos(6 * Math.PI * t);
    vec3_set(leftWingRotation, 0, 0, angle);
    vec3_set(rightWingRotation, 0, 0, -angle);

    quat_setFromEuler(leftWing.quaternion, leftWingRotation);
    quat_setFromEuler(rightWing.quaternion, rightWingRotation);
  };

  return scanner;
}
