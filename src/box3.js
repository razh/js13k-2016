import { object3d_traverse, object3d_updateMatrixWorld } from './object3d.js';
import {
  vec3_create,
  vec3_add,
  vec3_addVectors,
  vec3_min,
  vec3_max,
  vec3_multiplyScalar,
  vec3_applyMatrix4,
} from './vec3.js';

export function box3_create(min, max) {
  return {
    min: min || vec3_create(Infinity, Infinity, Infinity),
    max: max || vec3_create(-Infinity, -Infinity, -Infinity),
  };
}

export function box3_copy(a, b) {
  Object.assign(a.min, b.min);
  Object.assign(a.max, b.max);
  return a;
}

export function box3_makeEmpty(box) {
  box.min.x = box.min.y = box.min.z = Infinity;
  box.max.x = box.max.y = box.max.z -= Infinity;
  return box;
}

export function box3_center(box, center) {
  return vec3_multiplyScalar(
    vec3_addVectors(center, box.min, box.max),
    0.5
  );
}

export function box3_expandByPoint(box, point) {
  vec3_min(box.min, point);
  vec3_max(box.max, point);
  return box;
}

export var box3_setFromObject = (function() {
  var v1 = vec3_create();

  return function(box, object) {
    object3d_updateMatrixWorld(object);
    box3_makeEmpty(box);

    object3d_traverse(object, function(node) {
      var geometry = node.geometry;
      if (geometry) {
        var vertices = geometry.vertices;
        for (var i = 0; i < vertices.length; i++) {
          Object.assign(v1, vertices[i]);
          vec3_applyMatrix4(v1, node.matrixWorld);
          box3_expandByPoint(box, v1);
        }
      }
    });

    return box;
  };
}());

export function box3_containsPoint(box, point) {
  return (
    box.min.x <= point.x && point.x <= box.max.x &&
    box.min.y <= point.y && point.y <= box.max.y &&
    box.min.z <= point.z && point.z <= box.max.z
  );
}

export function box3_intersectsBox(a, b) {
  return !(
    a.max.x < b.min.x || a.min.x > b.max.x ||
    a.max.y < b.min.y || a.min.y > b.max.y ||
    a.max.z < b.min.z || a.min.z > b.max.z
  );
}

export function box3_translate(box, offset) {
  vec3_add(box.min, offset);
  vec3_add(box.max, offset);
  return box;
}
