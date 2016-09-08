import boxVertexIndices from './boxVertexIndices';
import {
  vec3_create,
  vec3_add,
  vec3_multiply,
  vec3_fromArray,
  vec3_setScalar,
} from './vec3';
import { rearg } from './utils';

function transformBoxVertices(method) {
  var vector = vec3_create();
  var zero = vec3_create();

  return function(geom, vectors) {
    Object.keys(vectors).map(function(key) {
      var delta = vectors[key];
      var indices = boxVertexIndices[key.toUpperCase()];

      if (Array.isArray(delta)) {
        vec3_fromArray(vector, delta);
      } else if (typeof delta === 'object') {
        Object.assign(vector, zero, delta);
      } else if (typeof delta === 'number') {
        vec3_setScalar(vector, delta);
      } else {
        return;
      }

      if (Array.isArray(indices)) {
        indices.map(function(index) {
          method(geom.vertices[index], vector);
        });
      } else {
        method(geom.vertices[indices], vector);
      }
    });

    return geom;
  };
}

export var translateBoxVertices = transformBoxVertices(vec3_add);
export var scaleBoxVertices = transformBoxVertices(vec3_multiply);

export var translate = rearg(translateBoxVertices);
export var scale = rearg(scaleBoxVertices);
