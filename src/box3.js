import { object3d_traverse, object3d_updateMatrixWorld } from ',/object3d';
import { vec3_create, vec3_min, vec3_max, vec3_applyMatrix4 } from './vec3';

export function box3_create(min, max) {
  return {
    min: min || vec3_create(Infinity, Infinity, Infinity),
    max: max || vec3_create(-Infinity, -Infinity, -Infinity),
  };
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

export function box3_makeEmpty(box) {
  box.min.x = box.min.y = box.min.z = Infinity;
  box.max.x = box.max.y = box.max.z -= Infinity;
  return box;
}
