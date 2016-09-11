import { face3_create } from './face3';
import { vec3_create, vec3_clone, vec3_add, vec3_multiply, vec3_set } from './vec3';
import { rearg3f } from './utils';

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

    geom.vertices.map(function(vertex) {
      vec3_add(vertex, vector);
    });

    return geom;
  };
}());

export var geom_scale = (function() {
  var vector = vec3_create();

  return function(geom, x, y, z) {
    vec3_set(vector, x, y, z);

    geom.vertices.map(function(vertex) {
      vec3_multiply(vertex, vector);
    });

    return geom;
  };
}());

export var translate = rearg3f(geom_translate);
export var scale = rearg3f(geom_scale);

export function geom_merge(a, b) {
  var vertexOffset = a.vertices.length;

  var i;
  for (i = 0; i < b.vertices.length; i++) {
    a.vertices.push(vec3_clone(b.vertices[i]));
  }

  for (i = 0; i < b.faces.length; i++) {
    var face = b.faces[i];
    var faceCopy = face3_create(
      face.a + vertexOffset,
      face.b + vertexOffset,
      face.c + vertexOffset
    );

    Object.assign(faceCopy.color, face.color);

    for (var j = 0; j < face.vertexColors.length; j++) {
      faceCopy.vertexColors.push(vec3_clone(face.vertexColors[j]));
    }

    a.faces.push(faceCopy);
  }
}
