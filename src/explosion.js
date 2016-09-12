import { boxGeom_create } from './boxGeom';
import { material_create } from './material';
import { mesh_create } from './mesh';
import { object3d_create, object3d_add, object3d_remove } from './object3d';
import {
  vec3_create,
  vec3_set,
  vec3_add,
  vec3_length,
  vec3_multiplyScalar,
  vec3_normalize,
  vec3_fromArray,
} from './vec3';
import { randFloat, randFloatSpread, sample } from './math';

var EPSILON = 1e-2;

var gravity = vec3_create(0, -10, 0);
var acceleration = vec3_create();
var distance = vec3_create();
var boxGeom = boxGeom_create(1, 1, 1);

var materials = [
  [1, 0.9, 0.2],
  [1, 0.9, 0.6],
  [1, 1, 0.8],
  [1, 1, 1],
].map(function(color) {
  var material = material_create();
  vec3_fromArray(material.emissive, color);
  return material;
});

export function explosion_create(count) {
  var explosion = object3d_create();

  var decay = 2;
  var velocities = [];

  var i = count;
  while (i--) {
    var sprite = mesh_create(boxGeom, sample(materials));
    var size = randFloat(0.05, 0.3);
    vec3_set(sprite.scale, size, size, size);

    vec3_set(
      sprite.position,
      randFloatSpread(0.2),
      randFloatSpread(0.2),
      randFloatSpread(0.2)
    );

    object3d_add(explosion, sprite);
    velocities.push(
      vec3_multiplyScalar(
        vec3_normalize(Object.assign(vec3_create(), sprite.position)),
       randFloat(1.5, 4)
      )
    );
  }

  explosion.update = function(dt, scene) {
    var drag = Math.exp(-decay * dt);
    vec3_multiplyScalar(Object.assign(acceleration, gravity), dt);

    var visibleCount = 0;

    explosion.children.map(function(sprite, index) {
      var velocity = velocities[index];
      vec3_multiplyScalar(Object.assign(distance, velocity), dt);
      vec3_add(velocity, acceleration);
      vec3_add(sprite.position, distance);
      vec3_multiplyScalar(sprite.scale, drag);

      if (vec3_length(sprite.scale) > EPSILON) {
        visibleCount++;
      }
    });

    if (!visibleCount) {
      object3d_remove(scene, explosion);
    }
  };

  return explosion;
}
