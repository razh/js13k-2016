import { boxGeom_create } from './boxGeom.js';
import { cylinderGeom_create, cylinderGeom_colorTop } from './cylinderGeom.js';
import { geom_create, geom_clone, geom_merge, translate } from './geom.js';
import { material_create } from './material.js';
import { mesh_create } from './mesh.js';
import { object3d_create, object3d_add, object3d_remove, object3d_translateZ, object3d_lookAt } from './object3d.js';
import { quat_setFromEuler } from './quat.js';
import { vec3_create, vec3_clone, vec3_set, vec3_distanceTo, vec3_applyQuaternion, vec3_X } from './vec3.js';
import { align } from './boxAlign.js';
import { colors, defaultColors } from './boxColors.js';
import { translateVertices, scaleVertices } from './boxTransform.js';
import { worm_create } from './worm.js';
import { laser_create } from './laser.js';
import { easing_cubic_inout } from './easings.js';
import { tween_create } from './tween.js';
import { bug_create } from './bug.js';
import { scanner_create } from './scanner.js';
import { explosion_create } from './explosion.js';
import { BODY_BULLET, BODY_STATIC, physics_create } from './physics.js';
import { path_create } from './path.js';
import { randFloat, sample } from './math.js';
import { playLaser } from './audio.js';
import { compose } from './utils.js';

var _vec3 = vec3_create();

export function create_map0(scene) {
  var bugY = 0.2;

  var pathA = [
    [-38, bugY, -8],
    [-38, bugY, -0],
    [7.5, bugY, 0],
  ];

  var pathB = [
    [-38, bugY, -18],
    [-8, bugY, -18],
    [-7.5, bugY, 0],
    [7.5, bugY, 0],
  ];

  var pathC = [
    [40, bugY, 1.5],
    [-7.5, bugY, 1.5],
  ];

  var pathD = [
    [40, bugY, -1.5],
    [-7.5, bugY, -1.5],
  ];

  function spawnBug() {
    var path = sample([pathA, pathB, pathC, pathD]);
    var bug = bug_create();
    object3d_add(scene, bug);
    path_create(bug, path);
  }

  function spawnScanner() {
    var angle = Math.random() * Math.PI;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);

    var randomCpuPosition = Math.random() < 0.5 ? 7.5 : -7.5;

    var outerRadius = randFloat(40, 48);
    var innerRadius = randFloat(8, 10);

    var path = [
      [outerRadius * cos + randomCpuPosition, randFloat(4, 6), outerRadius * sin],
      [innerRadius * cos + randomCpuPosition, randFloat(4, 6), innerRadius * sin],
    ];

    var scanner = scanner_create();
    object3d_add(scene, scanner);

    path_create(scanner, path, { easing: easing_cubic_inout }, function() {
      var quatObject = object3d_create();

      Object.assign(quatObject.position, scanner.position);
      object3d_lookAt(quatObject, vec3_create(randomCpuPosition, 0, 0));

      function fireScannerLaser() {
        var laser = laser_create(vec3_create(1, 0, 0));
        laser.physics = BODY_BULLET;
        Object.assign(laser.position, scanner.position);
        Object.assign(laser.quaternion, quatObject.quaternion);

        var position = vec3_clone(laser.position);
        vec3_applyQuaternion(Object.assign(_vec3, vec3_X), laser.quaternion);
        object3d_translateZ(laser, 2);

        laser.update = function(dt) {
          object3d_translateZ(laser, 16 * dt);
          if (vec3_distanceTo(position, laser.position) > 30) {
            object3d_remove(laser.parent, laser);
          }
        };

        object3d_add(scene, laser);
        playLaser();
      }

      var laserPeriod = 2;
      var time = 0;
      var previousTime = 0;
      scanner.update = function(dt) {
        time += dt;

        if ((time - previousTime) >= laserPeriod) {
          fireScannerLaser();
          previousTime = time;
          return;
        }
      };
    });
  }

  var previousBugTime = 0;
  var previousScannerTime = 0;
  var time = 0;

  var update = scene.update;
  var bugPeriod = 4;
  var scannerPeriod = 20;

  scene.update = function(dt) {
    if (update) { update(dt); }

    time += dt;
    if ((time - previousBugTime) > bugPeriod) {
      spawnBug();
      previousBugTime = time;
    }

    if ((time - previousScannerTime) > scannerPeriod) {
      spawnScanner();
      previousScannerTime = time;
    }
  };

  spawnBug();
  spawnScanner();

  var material = material_create();
  vec3_set(material.color, 0.8, 0.6, 0.7);
  vec3_set(material.specular, 0.5, 0.5, 0.5);
  material.shininess = 5;

  // Sockets.
  var socketGeometry = boxGeom_create(9, 30, 9);

  var cpu0SocketGeometry = compose(
    align('py'),
    translate(-8, 0, 0)
  )(geom_clone(socketGeometry));

  var cpu0Socket = mesh_create(cpu0SocketGeometry, material);
  physics_create(cpu0Socket, BODY_STATIC);
  object3d_add(scene, cpu0Socket);

  var cpu1SocketGeometry = compose(
    align('py'),
    translate(8, 0, 0)
  )(geom_clone(socketGeometry));

  var cpu1Socket = mesh_create(cpu1SocketGeometry, material);
  physics_create(cpu1Socket, BODY_STATIC);
  object3d_add(scene, cpu1Socket);

  // Bridges.
  var bridgeGeometry = align('py')(boxGeom_create(7, 3, 4));
  var bridge = mesh_create(bridgeGeometry, material);

  physics_create(bridge, BODY_STATIC);
  object3d_add(scene, bridge);

  var bridgeGreebleGeometry = boxGeom_create(1, 3, 0.5);

  for (var i = -3; i <= 3; i += 3) {
    geom_merge(
      bridgeGeometry,
      compose(
        align('py_nz'),
        translate(i, 0, 2)
      )(geom_clone(bridgeGreebleGeometry))
    );

    geom_merge(
      bridgeGeometry,
      compose(
        align('py_pz'),
        translate(i, 0, -2)
      )(geom_clone(bridgeGreebleGeometry))
    );
  }

  var bridge0A = mesh_create(
    compose(
      align('py'),
      translate(-8, 0, -12)
    )(boxGeom_create(4, 3, 16)),
    material
  );
  physics_create(bridge0A, BODY_STATIC);
  object3d_add(scene, bridge0A);

  var bridge0Ai = mesh_create(
    compose(
      align('px_py'),
      translate(-10, 0, -18)
    )(boxGeom_create(6, 3, 4)),
    material
  );
  physics_create(bridge0Ai, BODY_STATIC);
  object3d_add(scene, bridge0Ai);

  var bridge0B = mesh_create(
    compose(
      align('py'),
      translate(-14.25, 0, 0)
    )(boxGeom_create(3.5, 3, 2)),
    material
  );
  physics_create(bridge0B, BODY_STATIC);
  object3d_add(scene, bridge0B);

  var bridge1A = mesh_create(
    compose(
      align('nx_py'),
      translate(12.5, 0, 1.25)
    )(boxGeom_create(40, 3, 1.5)),
    material
  );
  physics_create(bridge1A, BODY_STATIC);
  object3d_add(scene, bridge1A);

  var bridge1B = mesh_create(
    compose(
      align('nx_py'),
      translate(12.5, 0, -1.25)
    )(boxGeom_create(40, 3, 1.5)),
    material
  );
  physics_create(bridge1B, BODY_STATIC);
  object3d_add(scene, bridge1B);

  // Towers.
  var towerA = mesh_create(
    translate(4, -10, -10)(boxGeom_create(15, 30, 8)),
    material
  );
  physics_create(towerA, BODY_STATIC);
  object3d_add(scene, towerA);

  var towerB = mesh_create(
    translate(22, -5, -11)(boxGeom_create(15, 30, 10)),
    material
  );
  physics_create(towerB, BODY_STATIC);
  object3d_add(scene, towerB);

  var towerC = mesh_create(
    compose(
      align('px_ny'),
      translate(-16, 0, -9)
    )(boxGeom_create(3, 3, 14)),
    material
  );
  physics_create(towerC, BODY_STATIC);
  object3d_add(scene, towerC);

  var towerD = mesh_create(
    compose(
      align('px_ny'),
      translate(-23, 0, -7),
      defaultColors([1, 1, 1]),
      colors({ ny: [0.5, 0.5, 0.5] })
    )(boxGeom_create(7, 12, 10)),
    material
  );
  physics_create(towerD, BODY_STATIC);
  object3d_add(scene, towerD);

  // Areas.
  var areaA = mesh_create(
    compose(
      align('px_py'),
      translate(-16, 0, -10)
    )(boxGeom_create(24, 30, 30)),
    material
  );
  physics_create(areaA, BODY_STATIC);
  object3d_add(scene, areaA);
}

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
