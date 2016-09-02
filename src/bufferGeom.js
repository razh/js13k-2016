import { bufferAttr_copyVector3sArray } from './bufferAttr';
import { directGeom_fromGeom } from './directGeom';

export function bufferGeom_create() {
  return {
    attrs: {},
  };
}

export function bufferGeom_fromGeom(bufferGeom, geom) {
  return bufferGeom_fromDirectGeom(bufferGeom, directGeom_fromGeom(geom));
}

export function bufferGeom_fromDirectGeom(bufferGeom, geom) {
  var positions = new Float32Array(geom.vertices.length * 3);
  bufferGeom_addAttribute(bufferGeom, 'p', bufferAttr_copyVector3sArray(positions, geom.vertices));

  if (geom.normals.length > 0) {
    var normals = new Float32Array(geom.normals.length * 3);
    bufferGeom_addAttribute(bufferGeom, 'n', bufferAttr_copyVector3sArray(normals, geom.normals));
  }

  return bufferGeom;
}

export function bufferGeom_addAttribute(geom, name, attr) {
  geom.attrs[name] = attr;
  return geom;
}
