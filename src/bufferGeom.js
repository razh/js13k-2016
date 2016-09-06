import { bufferAttr_copyColorsArray, bufferAttr_copyVector3sArray } from './bufferAttr';
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
  bufferGeom.attrs.position = bufferAttr_copyVector3sArray(positions, geom.vertices);

  var colors = new Float32Array(geom.colors.length * 3);
  bufferGeom.attrs.color = bufferAttr_copyColorsArray(colors, geom.colors);

  return bufferGeom;
}
