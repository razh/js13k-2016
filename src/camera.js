import { mat4_create, mat4_lookAt } from './mat4.js';
import { object3d_create } from './object3d.js';
import { quat_setFromRotationMatrix } from './quat.js';
import { vec3_clone, vec3_Y } from './vec3.js';

var DEG_TO_RAD = Math.PI / 180;

export function camera_create(fov, aspect, near, far) {
  return camera_updateProjectionMatrix(Object.assign(
    object3d_create(),
    {
      fov: fov || 60,
      near: near || 0.1,
      far: far || 2000,
      aspect: aspect || 1,
      up: vec3_clone(vec3_Y),
      matrixWorldInverse: mat4_create(),
      projectionMatrix: mat4_create(),
    }
  ));
}

export var camera_lookAt = (function() {
  var m1 = mat4_create();

  return function(camera, vector) {
    mat4_lookAt(m1, camera.position, vector, camera.up);
    quat_setFromRotationMatrix(camera.quaternion, m1);
  };
}());

export function camera_updateProjectionMatrix(camera) {
  var near = camera.near;
  var far = camera.far;

  var top = near * Math.tan(camera.fov * 0.5 * DEG_TO_RAD);
  var bottom = -top;
  var left = bottom * camera.aspect;
  var right = top * camera.aspect;

  var x = 2 * near / (right - left);
  var y = 2 * near / (top - bottom);

  var a = (right + left) / (right - left);
  var b = (top + bottom) / (top - bottom);
  var c = -(far + near) / (far - near);
  var d = -2 * far * near / (far - near);

  camera.projectionMatrix.set([
    x, 0, 0, 0,
    0, y, 0, 0,
    a, b, c, -1,
    0, 0, d, 0,
  ]);

  return camera;
}
