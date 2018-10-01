/* global _c, _r, _t */

import { bufferGeom_create, bufferGeom_fromGeom } from './bufferGeom.js';
import { box3_create } from './box3.js';
import { camera_create, camera_lookAt, camera_updateProjectionMatrix } from './camera.js';
import { directionalLight_create } from './directionalLight.js';
import { mat4_getInverse, mat4_multiplyMatrices } from './mat4.js';
import {
  object3d_create,
  object3d_add,
  object3d_remove,
  object3d_translateOnAxis,
  object3d_translateX,
  object3d_translateZ,
  object3d_traverse,
  object3d_updateMatrixWorld,
} from './object3d.js';
import {
  createShaderProgram,
  createFloat32Buffer,
  setFloat32Attribute,
  setFloatUniform,
  setMat4Uniform,
  setVec3Uniform,
  getAttributeLocations,
  getUniformLocations,
} from './shader.js';
import {
  vec3_create,
  vec3_clone,
  vec3_multiplyScalar,
  vec3_setFromMatrixPosition,
  vec3_set,
  vec3_sub,
  vec3_normalize,
  vec3_transformDirection,
  vec3_applyQuaternion,
  vec3_distanceTo,
  vec3_X,
} from './vec3.js';
import { laser_create } from './laser.js';
import { keys_create } from './keys.js';
import { controls_create } from './controls.js';
import { pointerLock_create } from './pointerLock.js';
import { tween_update } from './tween.js';
import { dust_create } from './dust.js';
import { cpu_create, CPU_HEALTH } from './cpu.js';
import { healthBar_create } from './healthBar.js';
import { explosion_create } from './explosion.js';
import { shake_create } from './shake.js';
import {
  BODY_DYNAMIC,
  BODY_BULLET,
  physics_create,
  physics_bodies,
  physics_update,
} from './physics.js';
import { playDrums, playLaser, playExplosion } from './audio.js';
import { clamp } from './math.js';
import { uniq } from './utils.js';
import { create_test, create_map0 } from './maps.js';

// import vs from './shaders/phong_vert.glsl';
// import fs from './shaders/phong_frag.glsl';
import { vert, frag } from './phong.js';

var _vec3 = vec3_create();

var running = true;
var scene = object3d_create();

var cameraY = 6;

// Dual-core.
var healthBarY = 5;

var cpu0 = cpu_create();
vec3_set(cpu0.position, -8, 0, 0);

var healthBar0 = healthBar_create(cpu0);
vec3_set(healthBar0.position, -8, healthBarY, 0);

var cpu1 = cpu_create();
vec3_set(cpu1.position, 8, 0, 0);

var healthBar1 = healthBar_create(cpu1);
vec3_set(healthBar1.position, 8, healthBarY, 0);

var dust = dust_create(
  box3_create(
    vec3_create(-16, 0, -8),
    vec3_create(16, 8, 8)
  ),
  40
);

var camera = camera_create(60, window.innerWidth / window.innerHeight);
var cameraSize = 0.2;
physics_create(camera, BODY_DYNAMIC);
camera.boundingBox = box3_create(
  vec3_create(-cameraSize, -cameraSize, -cameraSize),
  vec3_create(cameraSize, cameraSize, cameraSize)
);
vec3_set(camera.position, 6, cameraY, 8);
camera_lookAt(camera, vec3_create());
pointerLock_create(controls_create(camera), _c);

var cameraObject = object3d_create();
object3d_add(cameraObject, camera);

var keys = keys_create();

var fogColor = vec3_create(0, 0, 0);
var fogNear = 0.1;
var fogFar = 40;

var ambientLightColor = vec3_create(0.5, 0.5, 0.9);

var light = directionalLight_create(vec3_create(1, 0.5, 0.5));
var light2 = directionalLight_create(vec3_create(0.2, 0.3, 0.5));
vec3_set(light2.position, -2, 2, -2);
var directionalLights = [light, light2];


object3d_add(scene, cameraObject);
object3d_add(scene, light);
object3d_add(scene, light2);
object3d_add(scene, dust);
object3d_add(scene, cpu0);
object3d_add(scene, healthBar0);
object3d_add(scene, cpu1);
object3d_add(scene, healthBar1);
scene.cpus = [cpu0, cpu1];

// create_test(scene);
var map = object3d_create();
object3d_add(scene, map);
create_map0(map);

_c.width = window.innerWidth;
_c.height = window.innerHeight;

var gl = _c.getContext('webgl');
gl.clearColor(0, 0, 0, 0);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.getExtension('OES_standard_derivatives');

var program = createShaderProgram(gl, vert(), frag(directionalLights.length));

var attributes = getAttributeLocations(gl, program);
var uniforms = getUniformLocations(gl, program);

gl.useProgram(program);

var dt = 1/ 60;
var accumulatedTime = 0;
var previousTime;

function createCanFire(fireRate) {
  var period = 1 / fireRate;
  var previousTime = 0;

  return function(time) {
    if ((time - previousTime) < period) {
      return false;
    }

    previousTime = time;
    return true;
  };
}

var canFire = createCanFire(8);

var cameraDirection = vec3_create();

function limitCamera(camera) {
  vec3_set(
    camera.position,
    clamp(camera.position.x, -12, 12),
    6,
    clamp(camera.position.z, -8, 8)
  );
}

function updateCamera(dt) {
  var speed = 10;

  var x = 0;
  var z = 0;

  if (keys.KeyW || keys.ArrowUp) { z += -1; }
  if (keys.KeyS || keys.ArrowDown) { z += 1; }
  if (keys.KeyA || keys.ArrowLeft) { x += -1; }
  if (keys.KeyD || keys.ArrowRight) { x += 1; }

  if (!x && !z) {
    return;
  }

  vec3_normalize(vec3_set(cameraDirection, x, 0, z));
  object3d_translateOnAxis(camera, cameraDirection, speed * dt);
}

function createExplosion(object) {
  var explosion = explosion_create(15);
  Object.assign(explosion.position, object.position);
  object3d_add(scene, explosion);
  object3d_remove(object.parent, object);
  playExplosion();

  var distanceToCamera = vec3_distanceTo(camera.position, explosion.position);
  shake_create(
    cameraObject,
    // Decent enougb approximation for camera shake.
    1 / (2 * distanceToCamera)
  );
}

function update() {
  var time = (performance.now() || 0) * 1e-3;
  if (!previousTime) {
    previousTime = time;
  }

  var frameTime = Math.min(time - previousTime, 0.1);
  accumulatedTime += frameTime;
  previousTime = time;

  tween_update();

  light.position.x = Math.cos(time) * 3;
  light.position.z = Math.sin(time) * 3;

  while (accumulatedTime >= dt) {
    if (keys.Space && canFire(time)) {
      fireLaser();
    }

    object3d_traverse(scene, function(object) {
      if (object.update) {
        object.update(dt, scene);
      }
    });

    var collisions = physics_update(physics_bodies(scene));

    // Prevent multiple hits.
    uniq(collisions.hit).map(function(hit) {
      if (hit.health > 0) {
        hit.health--;
      }

      if (!hit.health && hit.physics === BODY_DYNAMIC) {
        createExplosion(hit);
      }
    });

    collisions.removed.map(function(removed) {
      if (removed.physics === BODY_BULLET || removed.enemy) {
        createExplosion(removed);
      }
    });

    updateCamera(dt);
    limitCamera(camera);

    accumulatedTime -= dt;
  }

  var isGameOver = scene.cpus.every(function(cpu) { return cpu.health <= 0; });
  if (isGameOver) {
    setTimeout(function() {
      running = false;
      _r.hidden = false;
      _r.disabled = false;
    }, 1000);
  }
}

function setFloat32AttributeBuffer(name, location, bufferGeom, size) {
  var buffer = (
    bufferGeom.buffers[name] ||
    (bufferGeom.buffers[name] = createFloat32Buffer(gl, bufferGeom.attrs[name]))
  );

  setFloat32Attribute(gl, location, buffer, size);
}

function renderMesh(mesh) {
  var geometry = mesh.geometry;
  var material = mesh.material;

  setVec3Uniform(gl, uniforms.fogColor, fogColor);
  setFloatUniform(gl, uniforms.fogNear, fogNear);
  setFloatUniform(gl, uniforms.fogFar, fogFar);

  setVec3Uniform(gl, uniforms.diffuse, material.color);
  setVec3Uniform(gl, uniforms.specular, material.specular);
  setFloatUniform(gl, uniforms.shininess, material.shininess);
  setVec3Uniform(gl, uniforms.emissive, material.emissive);

  mat4_multiplyMatrices(mesh.modelViewMatrix, camera.matrixWorldInverse, mesh.matrixWorld);

  setMat4Uniform(gl, uniforms.modelViewMatrix, mesh.modelViewMatrix);
  setMat4Uniform(gl, uniforms.projectionMatrix, camera.projectionMatrix);

  if (!geometry._bufferGeom) {
    geometry._bufferGeom = bufferGeom_fromGeom(bufferGeom_create(), geometry);
  }

  setFloat32AttributeBuffer('position', attributes.position, geometry._bufferGeom, 3);
  setFloat32AttributeBuffer('color', attributes.color, geometry._bufferGeom, 3);

  gl.drawArrays(gl.TRIANGLES, 0, geometry._bufferGeom.attrs.position.length / 3);
}

var lightDirection = vec3_create();

function render() {
  update();

  object3d_updateMatrixWorld(scene);
  mat4_getInverse(camera.matrixWorldInverse, camera.matrixWorld);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  setVec3Uniform(gl, uniforms.ambientLightColor, ambientLightColor);

  directionalLights.map(function(light, index) {
    vec3_set(_vec3, 0, 0, 0);

    var direction = vec3_setFromMatrixPosition(lightDirection, light.matrixWorld);
    vec3_setFromMatrixPosition(_vec3, light.target.matrixWorld);
    vec3_transformDirection(vec3_sub(direction, _vec3), camera.matrixWorldInverse);

    var color = vec3_multiplyScalar(Object.assign(_vec3, light.color), light.intensity);

    setVec3Uniform(gl, uniforms['directionalLights[' + index + '].direction'], direction);
    setVec3Uniform(gl, uniforms['directionalLights[' + index + '].color'], color);
  });

  object3d_traverse(scene, function(object) {
    if (object.visible && object.geometry && object.material) {
      renderMesh(object);
    }
  });

  if (running) {
    requestAnimationFrame(render);
  }
}

function resetGame() {
  if (running) {
    return;
  }

  _r.disabled = true;
  _r.hidden = true;
  cpu0.health = CPU_HEALTH;
  cpu1.health = CPU_HEALTH;

  object3d_remove(scene, map);
  map = object3d_create();
  object3d_add(scene, map);
  create_map0(map);

  previousTime = null;
  running = true;
  render();
  playDrums();
}

_r.addEventListener('click', resetGame);

function onDocumentClick() {
  _t.hidden = true;
  render();
  playDrums();
  document.removeEventListener('click', onDocumentClick);
}

document.addEventListener('click', onDocumentClick);

var laserCount = 0;
var laserSpeed = 16;
var maxLaserDistance = 40;

function fireLaser() {
  var laser = laser_create(vec3_create(0.3, 0.3, 1));
  laser.physics = BODY_BULLET;
  Object.assign(laser.position, camera.position);
  Object.assign(laser.quaternion, camera.quaternion);

  var position = vec3_clone(laser.position);
  vec3_applyQuaternion(Object.assign(_vec3, vec3_X), laser.quaternion);
  object3d_translateX(laser, laserCount % 2 ? -0.3 : 0.3);

  laser.update = function(dt) {
    object3d_translateZ(laser, -laserSpeed * dt);
    if (vec3_distanceTo(position, laser.position) > maxLaserDistance) {
      object3d_remove(laser.parent, laser);
    }
  };

  object3d_add(scene, laser);
  laserCount = (laserCount + 1) % 2;
  playLaser();
}

function setSize(width, height) {
  _c.width = width;
  _c.height = height;
  gl.viewport(0, 0, width, height);
}

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera_updateProjectionMatrix(camera);

  setSize(window.innerWidth, window.innerHeight);
});
