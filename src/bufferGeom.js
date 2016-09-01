import { bufferAttr_copyVectors3Array } from './bufferAttr';
import { directGeom_fromGeom } from './directGeom';

export function bufferGeom_create() {
  return {
    index: null,
    attrs: {},
  };
}

export function bufferGeom_fromGeom(bufferGeom, geom) {
  return bufferGeom_fromDirectGeom(bufferGeom, directGeom_fromGeom(geom));
}

export function bufferGeom_fromDirectGeom(bufferGeom, geom) {
  var positions = new Float32Array(geom.vertices.length * 3);
  bufferGeom_addAttribute('p', bufferAttr_copyVectors3Array(positions, geom.vertices));

  if (geom.normals.length > 0) {
    var normals = new Float32Array(geom.normals.length * 3);
    bufferGeom_addAttribute('n', bufferAttr_copyVectors3Array(normals, geom.normals));
  }

  return bufferGeom;
}

export function bufferGeom_addAttribute(geom, name, attr) {
  geom.attrs[name] = attr;
  return geom;
}
