import { boxGeom_create } from './boxGeom';
import { geom_merge, translate, scale } from './geom';
import { material_create } from './material';
import { mesh_create } from './mesh';
import { object3d_create, object3d_add } from './object3d';
import { quat_setFromEuler } from './quat';
import { vec3_create, vec3_set } from './vec3';
import { colors, defaultColors } from './boxColors';
import { translateVertices, scaleVertices } from './boxTransform';
import { compose } from './utils';

function createLegGeometry() {
  return geom_merge(
    // Thigh geometry.
    compose(
      translateVertices({
        // Align with foot.
        px_ny: { x: -0.04 },
        // Taller at base.
        nx_py: { y: 0.03 },
      }),
      // Wider at base.
      scaleVertices({ nx: [1, 1, 1.5] })
    )(boxGeom_create(0.2, 0.06, 0.08)),

    // Foot geometry.
    compose(
      defaultColors([1, 1, 1]),
      colors({ px_ny: [0.3, 0.3, 0.3] }),
      // Move to end of leg.
      translate(0.08, 0, 0),
      // Create a sharp point.
      scaleVertices({ px_ny: [1, 1, 0] }),
      translateVertices({
        // Move point out and down.
        px_ny: { x: 0.06, y: -0.1 },
        // Align with leg.
        nx_py: { x: 0.04 },
      })
    )(boxGeom_create(0.04, 0.06, 0.08))
  );
}

export function bug_create() {
  var bug = object3d_create();
  var material = material_create();

  var bodyGeometry = compose(
    defaultColors([1, 1, 1]),
    colors({ ny: [0.3, 0.3, 0.3] })
  )(boxGeom_create(0.3, 0.15, 0.8));

  var rightLegTranslate = translate(0.15, 0, 0);
  var leftLegTranslate = translate(-0.15, 0, 0);

  var legsGeometry = geom_merge(
    rightLegTranslate(createLegGeometry()),
    leftLegTranslate(scale(-1, 1, -1)(createLegGeometry()))
  );

  var body = mesh_create(bodyGeometry, material);
  var foreLegs = mesh_create(legsGeometry, material);
  var middleLegs = mesh_create(legsGeometry, material);
  var hindLegs = mesh_create(legsGeometry, material);

  var legDistance = 0.3;
  foreLegs.position.z = legDistance;
  hindLegs.position.z = -legDistance;

  object3d_add(bug, body);
  object3d_add(bug, foreLegs);
  object3d_add(bug, middleLegs);
  object3d_add(bug, hindLegs);

  var outerLegsRotation = vec3_create();
  var middleLegsRotation = vec3_create();

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
