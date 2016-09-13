import { boxGeom_create } from './boxGeom';
import { cylinderGeom_create, cylinderGeom_colorTop } from './cylinderGeom';
import { material_create } from './material';
import { mesh_create } from './mesh';
import { object3d_create, object3d_add } from './object3d';
import { quat_setFromEuler } from './quat';
import { vec3_create, vec3_set } from './vec3';
import { align } from './boxAlign';
import { colors, defaultColors } from './boxColors';
import { scaleVertices } from './boxTransform';
import { worm_create } from './worm';
import { laser_create } from './laser';
import { easing_cubic_inout } from './easings';
import { tween_create } from './tween';
import { bug_create } from './bug';
import { scanner_create } from './scanner';
import { explosion_create } from './explosion';
import { BODY_STATIC, physics_create } from './physics';
import { compose } from './utils';

var _vec3 = vec3_create();

export function create_test(scene) {
  var boxMaterial = material_create();
  vec3_set(boxMaterial.color, 1, 0.4, 0.8);
  vec3_set(boxMaterial.specular, 1, 1, 1);

  var box = boxGeom_create(1, 1, 1);
  align('px_py')(box);
  var mesh = mesh_create(box, boxMaterial);
  quat_setFromEuler(mesh.quaternion, vec3_create(0, 0, -Math.PI / 6));

  var box2 = boxGeom_create(1, 4, 1);
  compose(
    align('py'),
    scaleVertices({ py: 0 }),
    align('px'),
    defaultColors([1, 1, 1]),
    colors({ py: [0.5, 0, 1] })
  )(box2);
  var mesh2 = mesh_create(box2, boxMaterial);
  mesh2.position.x = 2;

  var group = object3d_create();
  var boxCount = 144;
  for (var i = 0; i < boxCount; i++) {
    var box3 = boxGeom_create(0.75, 0.2, 0.75);
    compose(
      defaultColors([1, 1, 1]),
      colors({ ny: [0.5, 0, 0.7] })
    )(box3);
    var mesh3 = mesh_create(box3, boxMaterial);
    mesh3.position.x = Math.floor(i / Math.sqrt(boxCount));
    mesh3.position.z = i % Math.sqrt(boxCount);
    object3d_add(group, mesh3);
  }

  physics_create(group, BODY_STATIC);
  group.position.x = -Math.sqrt(boxCount) / 2;
  group.position.z = -Math.sqrt(boxCount) / 2;

  var cylinder = cylinderGeom_create(1, 1, 4, 8, 1);
  defaultColors([0, 0, 0])(cylinder);
  cylinderGeom_colorTop(cylinder, [1, 1, 1]);
  var mesh4 = mesh_create(cylinder, boxMaterial);
  physics_create(mesh4, BODY_STATIC);

  setTimeout(function() {
    tween_create(mesh4.position, {
      to: { x: 2, y: 2, z: -1 },
      duration: 1000,
      easing: easing_cubic_inout,
    });
  }, 1000);

  var worm = worm_create(8, 0.5, 0.5, 1, 0.2);
  var bug = bug_create();
  vec3_set(bug.position, 3, 1, 5);
  var scanner = scanner_create();
  vec3_set(scanner.position, -1, 1, 5);

  var laser = laser_create(vec3_create(1, 0, 0));
  vec3_set(laser.position, 4, 1, 5);

  var explosion = explosion_create(25);
  vec3_set(explosion.position, 2, 1, 5);

  object3d_add(scene, mesh);
  object3d_add(scene, mesh2);
  object3d_add(scene, group);
  object3d_add(scene, mesh4);
  object3d_add(scene, worm);

  object3d_add(scene, bug);
  object3d_add(scene, scanner);
  object3d_add(scene, laser);
  object3d_add(scene, explosion);

  var t = 0;

  scene.update = function(dt) {
    t += dt;

    mesh.position.x = Math.cos(t);
    quat_setFromEuler(mesh.quaternion, vec3_set(_vec3, 0, 0, t + 1));
  };
}
