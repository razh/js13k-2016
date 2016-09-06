import { face3_create } from './face3';
import { vec3_create, vec3_add, vec3_set } from './vec3';

export function geom_create() {
  return {
    vertices: [],
    faces: [],
  };
}

export function geom_push(geom, vertices, faces) {
  var offset = geom.vertices.length;

  var i;
  for (i = 0; i < vertices.length; i += 3) {
    geom.vertices.push(
      vec3_create(
        vertices[i],
        vertices[i + 1],
        vertices[i + 2]
      )
    );
  }

  for (i = 0; i < faces.length; i += 3) {
    geom.faces.push(
      face3_create(
        offset + faces[i],
        offset + faces[i + 1],
        offset + faces[i + 2]
      )
    );
  }

  return geom;
}

export var geom_translate = (function() {
  var vector = vec3_create();

  return function(geom, x, y, z) {
    vec3_set(vector, x, y, z);

    geom.vertices.forEach(function(vertex) {
      vec3_add(vertex, vector);
    });

    return geom;
  };
}());
