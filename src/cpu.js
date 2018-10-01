import { boxGeom_create } from './boxGeom.js';
import { geom_create, geom_clone, geom_merge, translate } from './geom.js';
import { mesh_create } from './mesh.js';
import { material_create } from './material.js';
import { object3d_create, object3d_add } from './object3d.js';
import { vec3_set } from './vec3.js';
import { align } from './boxAlign.js';
import { colors, defaultColors } from './boxColors.js';
import { translateVertices } from './boxTransform.js';
import { BODY_STATIC, physics_create } from './physics.js';
import { compose } from './utils.js';

export var CPU_HEALTH = 20;

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

var pinWidth = 0.15;
var pinHeight = 0.4;

var pinGeometry = boxGeom_create(pinWidth, pinHeight, pinWidth);

var frontPinGeometry = compose(
  align('ny_nz'),
  translateVertices({
    py_pz: { y: -0.2 },
  })
)(geom_clone(pinGeometry));

var backPinGeometry = compose(
  align('ny_pz'),
  translateVertices({
    py_nz: { y: -0.2 },
  })
)(geom_clone(pinGeometry));

var leftPinGeometry = compose(
  align('px_ny'),
  translateVertices({
    nx_py: { y: -0.2 },
  })
)(geom_clone(pinGeometry));

var rightPinGeometry = compose(
  align('nx_ny'),
  translateVertices({
    px_py: { y: -0.2 },
  })
)(geom_clone(pinGeometry));

var frontRow = geom_create();
var backRow = geom_create();
var leftRow = geom_create();
var rightRow = geom_create();

for (var i = 0; i < 12; i++) {
  var distance = i * 0.5 - 2.75;
  geom_merge(frontRow, translate(distance, 0, halfCpuSize)(geom_clone(frontPinGeometry)));
  geom_merge(backRow, translate(distance, 0, -halfCpuSize)(geom_clone(backPinGeometry)));
  geom_merge(leftRow, translate(-halfCpuSize, 0, distance)(geom_clone(leftPinGeometry)));
  geom_merge(rightRow, translate(halfCpuSize, 0, distance)(geom_clone(rightPinGeometry)));
}

var pinsGeometry = geom_merge(geom_merge(geom_merge(frontRow, backRow), leftRow), rightRow);

export function cpu_create() {
  var cpu = object3d_create();
  cpu.health = CPU_HEALTH;

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
