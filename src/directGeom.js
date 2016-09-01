export function directGeom_fromGeom(geom) {
  var faces = geom.faces;

  var vertices = [];
  var normals = [];
  var colors = [];

  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    vertices.push(geom.vertices[face.a], geom.vertices[face.b], geom.vertices[face.c]);

    var normal = face.normal;
    normals.push(normal, normal, normal);

    var vertexColors = face.vertexColors;
    if (vertexColors.length === 3) {
      colors.push(vertexColors[0], vertexColors[1], vertexColors[2]);
    } else {
      var color = face.color;
      colors.push(color, color, color);
    }
  }

  return {
    vertices: vertices,
    normals: normals,
    colors: colors,
  };
}
