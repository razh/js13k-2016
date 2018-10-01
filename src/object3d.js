import {
  mat4_create,
  mat4_compose,
  mat4_copy,
  mat4_multiplyMatrices,
  mat4_lookAt,
} from './mat4.js';
import {
  quat_create,
  quat_multiply,
  quat_setFromAxisAngle,
  quat_setFromRotationMatrix,
} from './quat.js';
import {
  vec3_create,
  vec3_add,
  vec3_multiplyScalar,
  vec3_applyQuaternion,
  vec3_X,
  vec3_Y,
  vec3_Z,
} from './vec3.js';

export function object3d_create() {
  return {
    parent: null,
    children: [],
    position: vec3_create(),
    quaternion: quat_create(),
    scale: vec3_create(1, 1, 1),
    matrix: mat4_create(),
    matrixWorld: mat4_create(),
    modelViewMatrix: mat4_create(),
    visible: true,
  };
}

export var object3d_lookAt = (function() {
  var m1 = mat4_create();

  return function(object, vector) {
    mat4_lookAt(m1, vector, object.position, vec3_Y);
    quat_setFromRotationMatrix(object.quaternion, m1);
  };
}());

export function object3d_add(parent, child) {
  child.parent = parent;
  parent.children.push(child);
  return parent;
}

export function object3d_remove(parent, child) {
  var index = parent.children.indexOf(child);
  if (index >= 0) {
    parent.children.splice(index, 1);
  }
}

export var object3d_rotateOnAxis = (function() {
  var q1 = quat_create();

  return function rotateOnAxis(obj, axis, angle) {
    quat_setFromAxisAngle(q1, axis, angle);
    quat_multiply(obj.quaternion, q1);
    return obj;
  };
}());

export function object3d_rotateX(obj, angle) {
  return object3d_rotateOnAxis(obj, vec3_X, angle);
}

export function object3d_rotateY(obj, angle) {
  return object3d_rotateOnAxis(obj, vec3_Y, angle);
}

export function object3d_rotateZ(obj, angle) {
  return object3d_rotateOnAxis(obj, vec3_Z, angle);
}

export var object3d_translateOnAxis = (function() {
  var v1 = vec3_create();

  return function(obj, axis, distance) {
    vec3_applyQuaternion(Object.assign(v1, axis), obj.quaternion);
    vec3_add(obj.position, vec3_multiplyScalar(v1, distance));
    return obj;
  };
}());

export function object3d_translateX(obj, distance) {
  return object3d_translateOnAxis(obj, vec3_X, distance);
}

export function object3d_translateY(obj, distance) {
  return object3d_translateOnAxis(obj, vec3_Y, distance);
}

export function object3d_translateZ(obj, distance) {
  return object3d_translateOnAxis(obj, vec3_Z, distance);
}

export function object3d_traverse(obj, callback) {
  callback(obj);

  var children = obj.children;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    object3d_traverse(child, callback);
  }
}

export function object3d_updateMatrix(obj) {
  mat4_compose(obj.matrix, obj.position, obj.quaternion, obj.scale);
}

export function object3d_updateMatrixWorld(obj) {
  object3d_updateMatrix(obj);

  if (!obj.parent) {
    mat4_copy(obj.matrixWorld, obj.matrix);
  } else {
    mat4_multiplyMatrices(obj.matrixWorld, obj.parent.matrixWorld, obj.matrix);
  }

  obj.children.map(object3d_updateMatrixWorld);
}
