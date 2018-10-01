import { boxGeom_create } from './boxGeom.js';
import { geom_clone, translate, scale } from './geom.js';
import { material_create } from './material.js';
import { mesh_create } from './mesh.js';
import { object3d_create, object3d_add } from './object3d.js';
import { vec3_set } from './vec3.js';

var barWidth = 5;

var barGeometry = boxGeom_create(barWidth, 0.5, 0.5);

var innerBarGeometry = translate(-barWidth / 2, 0, 0)(geom_clone(barGeometry));
var outerBarGeometry = scale(-1, 1, 1)(geom_clone(barGeometry));

export function healthBar_create(object) {
  var maxHealth = object.health;

  var innerBarMaterial = material_create();
  vec3_set(innerBarMaterial.emissive, 0, 1, 0);

  var outerBarMaterial = material_create();
  vec3_set(outerBarMaterial.color, 0, 0, 0);
  vec3_set(outerBarMaterial.emissive, 0.1, 0.1, 0.1);

  var innerBar = mesh_create(innerBarGeometry, innerBarMaterial);
  var outerBar = mesh_create(outerBarGeometry, outerBarMaterial);

  innerBar.position.x = barWidth / 2;

  var healthBar = object3d_create();

  object3d_add(healthBar, innerBar);
  object3d_add(healthBar, outerBar);

  healthBar.update = function() {
    var t = object.health / maxHealth;
    // Sorry, no room for HSL.
    vec3_set(innerBarMaterial.emissive, 1 - t, t, 0);
    vec3_set(innerBar.scale, t, 1, 1);

    innerBar.visible = !!object.health;
  };

  return healthBar;
}
