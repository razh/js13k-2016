import { geom_create, geom_push } from './geom';

export function cylinderGeom_create(
  radiusTop,
  radiusBottom,
  height,
  radialSegments,
  heightSegments,
  openEnded
) {
  radiusTop = radiusTop !== undefined ? radiusTop : 20;
  radiusBottom = radiusBottom !== undefined ? radiusBottom : 20;
  height = height !== undefined ? height: 100;

  radialSegments = radialSegments || 8;
  heightSegments = heightSegments || 1;

  openEnded = openEnded || false;

  var vertices = [];
  var faces = [];

  var x, y;
  var halfHeight = height / 2;

  var verticesGrid = [];

  for (y = 0; y <= heightSegments; y++) {
    var verticesRow = [];

    var v = y / heightSegments;
    var radius = v * (radiusBottom - radiusTop) + radiusTop;

    for (x = 0; x <= radialSegments; x++) {
      var u = x / radialSegments;

      vertices.push(
        radius * Math.sin(2 * Math.PI * u),
        -v * height + halfHeight,
        radius * Math.cos(2 * Math.PI * u)
      );

      var index = (vertices.length / 3) - 1;
      verticesRow.push(index);
    }

    verticesGrid.push(verticesRow);
  }

  var v0, v1, v2, v3;

  for (x = 0; x < radialSegments; x++) {
    for (y = 0; y < heightSegments; y++) {
      v0 = verticesGrid[y][x];
      v1 = verticesGrid[y + 1][x];
      v2 = verticesGrid[y + 1][x + 1];
      v3 = verticesGrid[y][x + 1];

      faces.push(
        v0, v1, v3,
        v1, v2, v3
      );
    }
  }

  // Top cap.
  if (!openEnded && radiusTop) {
    vertices.push(0, halfHeight, 0);

    for (x = 0; x < radialSegments; x++) {
      v0 = verticesGrid[0][x];
      v1 = verticesGrid[0][x + 1];
      v2 = (vertices.length / 3) - 1;

      faces.push(v0, v1, v2);
    }
  }

  // Bottom cap.
  if (!openEnded && radiusBottom) {
    vertices.push(0, -halfHeight, 0);

    for (x = 0; x < radialSegments; x++) {
      v0 = verticesGrid[heightSegments][x + 1];
      v1 = verticesGrid[heightSegments][x];
      v2 = (vertices.length / 3) - 1;

      faces.push(v0, v1, v2);
    }
  }

  return geom_push(geom_create(), vertices, faces);
}
