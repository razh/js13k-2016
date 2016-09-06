import boxVertexIndices from './boxVertexIndices';
import { color_create } from './color';

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
    var color = color_create.apply(null, colors[key]);
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
  defaultColor = color_create.apply(null, defaultColor);

  geom.faces.forEach(function(face) {
    for (var i = 0; i < 3; i++) {
      if (face.vertexColors[i] === undefined) {
        face.vertexColors[i] = defaultColor;
      }
    }
  });

  return geom;
}
