import { boxGeom_create } from './boxGeom.js';
import { object3d_create, object3d_add } from './object3d.js';
import { material_create } from './material.js';
import { mesh_create } from './mesh.js';
import { vec3_set } from './vec3.js';
import { randFloat } from './math.js';

var geometry = boxGeom_create(1, 1, 1);
var material = material_create();
vec3_set(material.color, 0, 0, 0);
vec3_set(material.emissive, 0.3, 0.3, 0.3);

export function dust_create(box, count) {
  var dust = object3d_create();

  var i = count;
  while (i--) {
    var sprite = mesh_create(geometry, material);
    var size = randFloat(0.01, 0.05);
    vec3_set(sprite.scale, size, size, size);

    vec3_set(
      sprite.position,
      randFloat(box.min.x, box.max.x),
      randFloat(box.min.y, box.max.y),
      randFloat(box.min.z, box.max.z)
    );

    object3d_add(dust, sprite);
  }

  return dust;
}
