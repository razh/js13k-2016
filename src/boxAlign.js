import boxVertexIndices from './boxVertexIndices.js';
import { vec3_create, vec3_add, vec3_divideScalar, vec3_set } from './vec3.js';
import { geom_translate } from './geom.js';
import { rearg } from './utils.js';

var centroid = vec3_create();

export function alignBoxVertices(geom, alignment) {
  var indices = boxVertexIndices[alignment.toUpperCase()];

  if (Array.isArray(indices)) {
    vec3_set(centroid, 0, 0, 0);

    indices.map(function(index) {
      vec3_add(centroid, geom.vertices[index]);
    });

    vec3_divideScalar(centroid, indices.length);
  } else {
    Object.assign(centroid, geom.vertices[indices]);
  }

  return geom_translate(geom, -centroid.x, -centroid.y, -centroid.z);
}

export var align = rearg(alignBoxVertices);
