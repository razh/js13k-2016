import boxVertexIndices from './boxVertexIndices';
import { vec3_create, vec3_copy, vec3_add, vec3_divideScalar, vec3_set } from './vec3';
import { geom_translate } from './geom';

var centroid = vec3_create();

export function alignBoxVertices(geom, alignment) {
  var indices = boxVertexIndices[alignment.toUpperCase()];

  if (Array.isArray(indices)) {
    vec3_set(centroid, 0, 0, 0);

    indices.forEach(function(index) {
      vec3_add(centroid, geom.vertices[index]);
    });

    vec3_divideScalar(centroid, indices.length);
  } else {
    vec3_copy(centroid, geom.vertices[indices]);
  }

  return geom_translate(geom, -centroid.x, -centroid.y, -centroid.z);
}
