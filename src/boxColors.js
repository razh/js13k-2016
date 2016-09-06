import boxVertexIndices from './boxVertexIndices';
import { vec3_create, vec3_fromArray } from './vec3';

function setFaceVertexColor(face, index, color) {
  if (face.a === index) {
    face.vertexColors[0] = color;
  }

  if (face.b === index) {
    face.vertexColors[1] = color;
  }

  if (face.c === index) {
    face.vertexColors[2] = color;
  }
}

export function applyBoxVertexColors(geom, colors) {
  Object.keys(colors).forEach(function(key) {
    var color = vec3_fromArray(vec3_create(), colors[key]);
    var indices = boxVertexIndices[key.toUpperCase()];

    geom.faces.forEach(function(face) {
      if (Array.isArray(indices)) {
        indices.forEach(function(index) {
          setFaceVertexColor(face, index, color);
        });
      } else {
        setFaceVertexColor(face, indices, color);
      }
    });
  });

  return geom;
}

export function applyDefaultVertexColors(geom, defaultColor) {
  defaultColor = vec3_fromArray(vec3_create(), defaultColor);

  geom.faces.forEach(function(face) {
    for (var i = 0; i < 3; i++) {
      if (face.vertexColors[i] === undefined) {
        face.vertexColors[i] = defaultColor;
      }
    }
  });

  return geom;
}
