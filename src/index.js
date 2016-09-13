/* global c */

import { boxGeom_create } from './boxGeom';
import { bufferGeom_create, bufferGeom_fromGeom } from './bufferGeom';
import { box3_create } from './box3';
import { camera_create, camera_lookAt, camera_updateProjectionMatrix } from './camera';
import { cylinderGeom_create, cylinderGeom_colorTop } from './cylinderGeom';
import { directionalLight_create } from './directionalLight';
import { mat4_getInverse, mat4_multiplyMatrices } from './mat4';
import { material_create } from './material';
import { mesh_create } from './mesh';
import {
  object3d_create,
  object3d_add,
  object3d_remove,
  object3d_translateOnAxis,
  object3d_translateX,
  object3d_translateZ,
  object3d_traverse,
  object3d_updateMatrixWorld,
} from './object3d';
import { quat_setFromEuler } from './quat';
import {
  createShaderProgram,
  createFloat32Buffer,
  setFloat32Attribute,
  setFloatUniform,
  setMat4Uniform,
  setVec3Uniform,
  getAttributeLocations,
  getUniformLocations,
} from './shader';
import {
  vec3_create,
  vec3_multiplyScalar,
  vec3_setFromMatrixPosition,
  vec3_set,
  vec3_sub,
  vec3_normalize,
  vec3_transformDirection,
  vec3_applyQuaternion,
  vec3_distanceTo,
  vec3_X,
} from './vec3';
import { align } from './boxAlign';
import { colors, defaultColors } from './boxColors';
import { scaleVertices } from './boxTransform';
import { worm_create } from './worm';
import { laser_create } from './laser';
import { keys_create } from './keys';
import { controls_create } from './controls';
import { pointerLock_create } from './pointerLock';
import { easing_cubic_inout } from './easings';
import { tween_create, tween_update } from './tween';
import { bug_create } from './bug';
import { scanner_create } from './scanner';
import { dust_create } from './dust';
import { cpu_create } from './machines';
import { explosion_create } from './explosion';
import {
  BODY_STATIC,
  BODY_DYNAMIC,
  BODY_BULLET,
  physics_create,
  physics_bodies,
  physics_update,
} from './physics';
import { compose } from './utils';
import playAudio, { playLaser, playExplosion } from './audio';

// import vs from './shaders/phong_vert.glsl';
// import fs from './shaders/phong_frag.glsl';
import { vert, frag } from './phong';

var _vec3 = vec3_create();

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

var cpu = cpu_create();
vec3_set(cpu.position, 10, 0, 0);

var dust = dust_create(
  box3_create(
    vec3_create(-10, 0, -10),
    vec3_create(10, 10, 10)
  ),
  30
);

var camera = camera_create(60, window.innerWidth / window.innerHeight);
var cameraSize = 0.2;
physics_create(camera, BODY_DYNAMIC);
camera.boundingBox = box3_create(
  vec3_create(-cameraSize, -cameraSize, -cameraSize),
  vec3_create(cameraSize, cameraSize, cameraSize)
);
vec3_set(camera.position, 4, 2, 8);
camera_lookAt(camera, vec3_create());
pointerLock_create(controls_create(camera), c);

var keys = keys_create();

var fogColor = vec3_create(0, 0, 0);
var fogNear = 0.1;
var fogFar = 40;

var ambientLightColor = vec3_create(0.5, 0.5, 0.9);

var light = directionalLight_create(vec3_create(1, 0.5, 0.5));
var light2 = directionalLight_create(vec3_create(0.2, 0.3, 0.5));
vec3_set(light2.position, -2, 2, -2);
var directionalLights = [light, light2];

var scene = object3d_create();
object3d_add(scene, mesh);
object3d_add(scene, mesh2);
object3d_add(scene, group);
object3d_add(scene, mesh4);
object3d_add(scene, worm);
object3d_add(scene, camera);
object3d_add(scene, light);
object3d_add(scene, light2);
object3d_add(scene, bug);
object3d_add(scene, scanner);
object3d_add(scene, dust);
object3d_add(scene, laser);
object3d_add(scene, explosion);
object3d_add(scene, cpu);

c.width = window.innerWidth;
c.height = window.innerHeight;

var gl = c.getContext('webgl');
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

var canFire = (function() {
  var period = 1 / 8;
  var previousTime = 0;

  return function(time) {
    if ((time - previousTime) < period) {
      return false;
    }

    previousTime = time;
    return true;
  };
}());

var cameraDirection = vec3_create();

function updateCamera(dt) {
  var speed = 4;

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

function update(time) {
  time = (time || 0) * 1e-3;
  if (!previousTime) {
    previousTime = time;
  }

  var frameTime = Math.min(time - previousTime, 0.1);
  accumulatedTime += frameTime;
  previousTime = time;

  tween_update();

  mesh.position.x = Math.cos(time);
  quat_setFromEuler(mesh.quaternion, vec3_set(_vec3, 0, 0, time + 1));
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
    collisions.removed.map(function(body) {
      if (body.physics === BODY_BULLET) {
        var explosion = explosion_create(15);
        Object.assign(explosion.position, body.position);
        object3d_add(scene, explosion);
        object3d_remove(scene, body);
        playExplosion();
      }
    });

    updateCamera(dt);

    accumulatedTime -= dt;
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

function render(time) {
  update(time);

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
    if (object.geometry && object.material) {
      renderMesh(object);
    }
  });

  requestAnimationFrame(render);
}

render();
playAudio();

var laserCount = 0;
var maxLaserDistance = 40;

function fireLaser() {
  var laser = laser_create(vec3_create(0.3, 0.3, 1));
  laser.physics = BODY_BULLET;
  Object.assign(laser.position, camera.position);
  Object.assign(laser.quaternion, camera.quaternion);

  var position = Object.assign(vec3_create(), laser.position);
  vec3_applyQuaternion(Object.assign(_vec3, vec3_X), laser.quaternion);
  object3d_translateX(laser, laserCount % 2 ? -0.3 : 0.3);

  laser.update = function(dt) {
    object3d_translateZ(laser, -16 * dt);
    if (vec3_distanceTo(position, laser.position) > maxLaserDistance) {
      object3d_remove(scene, laser);
    }
  };

  object3d_add(scene, laser);
  laserCount = (laserCount + 1) % 2;
  playLaser();
}

function setSize(width, height) {
  c.width = width;
  c.height = height;
  gl.viewport(0, 0, width, height);
}

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera_updateProjectionMatrix(camera);

  setSize(window.innerWidth, window.innerHeight);
});
