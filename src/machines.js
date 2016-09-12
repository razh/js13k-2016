import { boxGeom_create } from './boxGeom';
import { cylinderGeom_create } from './cylinderGeom';
import { geom_merge } from './geom';
import { mesh_create } from './mesh';
import { material_create } from './material';
import { object3d_create, object3d_add } from './object3d';

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

export function cpu_create() {
  var cpu = object3d_create();
  var cpuMaterial = material_create();

  var chipGeometry = boxGeom_create(4, 0.5, 4);
  var pinGeometry = boxGeom_create(0.1, 0.1, 0.1);

  var chip = mesh_create(chipGeometry, cpuMaterial);
  var pin = mesh_create(pinGeometry, cpuMaterial);

  object3d_add(cpu, chip);
  object3d_add(cpu, pin);

  return cpu;
}
