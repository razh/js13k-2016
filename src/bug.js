import { boxGeom_create } from './boxGeom.js';
import { geom_clone, geom_merge, translate, scale } from './geom.js';
import { material_create } from './material.js';
import { mesh_create } from './mesh.js';
import { object3d_create, object3d_add } from './object3d.js';
import { quat_setFromEuler } from './quat.js';
import { vec3_create, vec3_set } from './vec3.js';
import { BODY_DYNAMIC, physics_create } from './physics.js';
import { colors, defaultColors } from './boxColors.js';
import { translateVertices, scaleVertices } from './boxTransform.js';
import { compose } from './utils.js';

var legGeometry = geom_merge(
  // Thigh geometry.
  compose(
    translateVertices({
      // Align with foot.
      px_ny: { x: -0.08 },
      // Taller at base.
      nx_py: { y: 0.06 },
    }),
    // Wider at base.
    scaleVertices({ nx: [1, 1, 1.5] })
  )(boxGeom_create(0.4, 0.12, 0.16)),

  // Foot geometry.
  compose(
    defaultColors([1, 1, 1]),
    colors({ px_ny: [0.3, 0.3, 0.3] }),
    // Move to end of leg.
    translate(0.16, 0, 0),
    // Create a sharp point.
    scaleVertices({ px_ny: [1, 1, 0] }),
    translateVertices({
      // Move point out and down.
      px_ny: { x: 0.12, y: -0.2 },
      // Align with leg.
      nx_py: { x: 0.08 },
    })
  )(boxGeom_create(0.08, 0.12, 0.16))
);

var bodyGeometry = compose(
  defaultColors([1, 1, 1]),
  colors({ ny: [0.3, 0.3, 0.3] })
)(boxGeom_create(0.6, 0.3, 1.6));

var rightLegTranslate = translate(0.3, 0, 0);
var leftLegTranslate = translate(-0.3, 0, 0);

var legsGeometry = geom_merge(
  rightLegTranslate(geom_clone(legGeometry)),
  leftLegTranslate(scale(-1, 1, -1)(geom_clone(legGeometry)))
);

var outerLegsRotation = vec3_create();
var middleLegsRotation = vec3_create();

export function bug_create() {
  var bug = object3d_create();
  var material = material_create();
  vec3_set(material.emissive, 0.1, 0.1, 0.1);

  bug.health = 2;
  bug.speed = 1.5;
  bug.enemy = true;

  var body = mesh_create(bodyGeometry, material);
  var foreLegs = mesh_create(legsGeometry, material);
  var middleLegs = mesh_create(legsGeometry, material);
  var hindLegs = mesh_create(legsGeometry, material);

  var legDistance = 0.6;
  foreLegs.position.z = legDistance;
  hindLegs.position.z = -legDistance;

  object3d_add(bug, body);
  object3d_add(bug, foreLegs);
  object3d_add(bug, middleLegs);
  object3d_add(bug, hindLegs);

  physics_create(bug, BODY_DYNAMIC);

  var t = 0;

  bug.update = function(dt) {
    t += dt;

    var angle = Math.PI / 10 * Math.cos(4 * Math.PI * t);
    vec3_set(outerLegsRotation, 0, angle, 0);
    vec3_set(middleLegsRotation, 0, -angle, 0);
    quat_setFromEuler(foreLegs.quaternion, outerLegsRotation);
    quat_setFromEuler(hindLegs.quaternion, outerLegsRotation);
    quat_setFromEuler(middleLegs.quaternion, middleLegsRotation);
  };

  return bug;
}
