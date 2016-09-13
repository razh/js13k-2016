import { boxGeom_create } from './boxGeom';
import { cylinderGeom_create } from './cylinderGeom';
import { geom_create, geom_merge, translate } from './geom';
import { mesh_create } from './mesh';
import { material_create } from './material';
import { object3d_create, object3d_add } from './object3d';
import { vec3_set } from './vec3';
import { align } from './boxAlign';
import { colors, defaultColors } from './boxColors';
import { translateVertices } from './boxTransform';
import { BODY_STATIC, physics_create } from './physics';
import { compose } from './utils';

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

var cpuSize = 6;
var halfCpuSize = cpuSize / 2;
var cpuBottomHeight = 0.5;
var cpuBevel = 0.4;

var chipGeometry = geom_merge(
  // Bottom.
  compose(
    align('ny'),
    defaultColors([1, 1, 1]),
    colors({
      ny: [0.5, 0.5, 0.5],
    })
  )(boxGeom_create(cpuSize, cpuBottomHeight, cpuSize)),

  // Top.
  compose(
    align('ny'),
    translate(0, cpuBottomHeight, 0),
    translateVertices({
      px_py: { x: -cpuBevel },
      nx_py: { x: cpuBevel },

      py_pz: { z: -cpuBevel },
      py_nz: { z: cpuBevel },
    })
  )(boxGeom_create(cpuSize, 0.1, cpuSize))
);

function createPinGeometry(transform) {
  var pinWidth = 0.15;
  var pinHeight = 0.4;

  return transform(boxGeom_create(pinWidth, pinHeight, pinWidth));
}

function createFrontPin() {
  return createPinGeometry(
    compose(
      align('ny_nz'),
      translateVertices({
        py_pz: { y: -0.2 },
      })
    )
  );
}

function createBackPin() {
  return createPinGeometry(
    compose(
      align('ny_pz'),
      translateVertices({
        py_nz: { y: -0.2 },
      })
    )
  );
}

function createLeftPin() {
  return createPinGeometry(
    compose(
      align('px_ny'),
      translateVertices({
        nx_py: { y: -0.2 },
      })
    )
  );
}

function createRightPin() {
  return createPinGeometry(
    compose(
      align('nx_ny'),
      translateVertices({
        px_py: { y: -0.2 },
      })
    )
  );
}

var frontRow = geom_create();
var backRow = geom_create();
var leftRow = geom_create();
var rightRow = geom_create();

for (var i = 0; i < 12; i++) {
  var distance = i * 0.5 - 2.75;
  geom_merge(frontRow, translate(distance, 0, halfCpuSize)(createFrontPin()));
  geom_merge(backRow, translate(distance, 0, -halfCpuSize)(createBackPin()));
  geom_merge(leftRow, translate(-halfCpuSize, 0, distance)(createLeftPin()));
  geom_merge(rightRow, translate(halfCpuSize, 0, distance)(createRightPin()));
}

var pinsGeometry = geom_merge(geom_merge(geom_merge(frontRow, backRow), leftRow), rightRow);

export function cpu_create() {
  var cpu = object3d_create();

  var chipMaterial = material_create();
  vec3_set(chipMaterial.color, 0.5, 0.5, 0.5);
  chipMaterial.shininess = 5;
  var pinsMaterial = material_create();
  vec3_set(pinsMaterial.emissive, 0.1, 0.1, 0.1);
  vec3_set(pinsMaterial.specular, 1, 1, 1);
  pinsMaterial.shininess = 100;

  var chip = mesh_create(chipGeometry, chipMaterial);
  var pins = mesh_create(pinsGeometry, pinsMaterial);

  object3d_add(cpu, chip);
  physics_create(cpu, BODY_STATIC);

  object3d_add(cpu, pins);

  return cpu;
}
