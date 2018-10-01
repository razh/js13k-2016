import { cylinderGeom_create } from './cylinderGeom.js';
import { mesh_create } from './mesh.js';
import { material_create } from './material.js';
import { object3d_create, object3d_add } from './object3d.js';

export function piston_create() {
  var piston = object3d_create();
  var pistonMaterial = material_create();

  var headGeom = cylinderGeom_create();
  var head = mesh_create(headGeom, pistonMaterial);

  var shaftGeom = cylinderGeom_create();
  var shaft = mesh_create(shaftGeom, pistonMaterial);

  object3d_add(piston, head);
  object3d_add(piston, shaft);

  piston.update = function() {};

  return piston;
}
