import { cylinderGeom_create } from './cylinderGeom';
import { mesh_create } from './mesh';
import { material_create } from './material';
import { object3d_create, object3d_add } from './object';

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
