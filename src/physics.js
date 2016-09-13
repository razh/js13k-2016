import {
  box3_create,
  box3_copy,
  box3_center,
  box3_containsPoint,
  box3_intersectsBox,
  box3_setFromObject,
  box3_translate,
} from './box3';
import { object3d_traverse } from './object3d';
import {
  vec3_create,
  vec3_set,
  vec3_add,
  vec3_sub,
  vec3_multiplyScalar,
} from './vec3';

export var BODY_STATIC = 1;
export var BODY_DYNAMIC = 2;
export var BODY_BULLET = 4;

export function physics_create(obj, type) {
  obj.physics = type;
  obj.boundingBox = box3_setFromObject(box3_create(), obj);
  return obj;
}

export function physics_bodies(obj) {
  var bodies = [];

  object3d_traverse(obj, function(node) {
    if (node.physics) {
      bodies.push(node);
    }
  });

  return bodies;
}

var penetration = vec3_create();

var box = box3_create();
var boxA = box3_create();
var boxB = box3_create();

var centerA = box3_create();
var centerB = box3_create();

export function physics_update(bodies) {
  var collisions = {
    hit: [],
    removed: [],
  };

  for (var i = 0; i < bodies.length; i++) {
    var bodyA = bodies[i];

    for (var j = 0; j < bodies.length; j++) {
      var bodyB = bodies[j];

      if (!bodyA.physics || !bodyB.physics) {
        continue;
      }

      // Immovable objects.
      if (bodyA.physics === BODY_STATIC &&
          bodyA.physics === BODY_STATIC) {
        continue;
      }

      // Projectiles don't collide.
      if (bodyA.physics === BODY_BULLET &&
          bodyB.physics === BODY_BULLET) {
        continue;
      }

      // One projectile.
      if ((bodyA.physics === BODY_BULLET && bodyB.physics !== BODY_BULLET) ||
          (bodyA.physics !== BODY_BULLET && bodyB.physics === BODY_BULLET)) {
        var bullet;
        var body;

        if (bodyA.physics === BODY_BULLET) {
          bullet = bodyA;
          body = bodyB;
        } else {
          bullet = bodyB;
          body = bodyA;
        }

        box3_translate(box3_copy(box, body.boundingBox), body.position);
        if (box3_containsPoint(box, bullet.position)) {
          collisions.hit.push(body);
          collisions.removed.push(bullet);
        }

        continue;
      }

      // Two dynamic bodies, or one static and one dynamic body.
      box3_translate(box3_copy(boxA, bodyA.boundingBox), bodyA.position);
      box3_translate(box3_copy(boxB, bodyB.boundingBox), bodyB.position);

      if (box3_intersectsBox(boxA, boxB)) {
        box3_center(boxA, centerA);
        box3_center(boxB, centerB);

        // Determine overlap.
        // d0 is negative side or 'left' side.
        // d1 is positive or 'right' side.
        var d0x = boxB.max.x - boxA.min.x;
        var d1x = boxA.max.x - boxB.min.x;

        var d0y = boxB.max.y - boxA.min.y;
        var d1y = boxA.max.y - boxB.min.y;

        var d0z = boxB.max.z - boxA.min.z;
        var d1z = boxA.max.z - boxB.min.z;

        // Only overlapping on an axis if both ranges intersect.
        var dx = 0;
        if (d0x > 0 && d1x > 0) {
          dx = d0x < d1x ? d0x : -d1x;
        }

        var dy = 0;
        if (d0y > 0 && d1y > 0) {
          dy = d0y < d1y ? d0y : -d1y;
        }

        var dz = 0;
        if (d0z > 0 && d1z > 0) {
          dz = d0z < d1z ? d0z : -d1z;
        }

        // Determine minimum axis of separation.
        var adx = Math.abs(dx);
        var ady = Math.abs(dy);
        var adz = Math.abs(dz);

        if (adx <= ady && ady <= adz) {
          vec3_set(penetration, dx, 0, 0);
        } else if (ady <= adx && ady <= adz) {
          vec3_set(penetration, 0, dy, 0);
        } else {
          vec3_set(penetration, 0, 0, dz);
        }

        if (bodyA.physics === BODY_STATIC) {
          vec3_sub(bodyB.position, penetration);
        } else if (bodyB.physics === BODY_STATIC) {
          vec3_add(bodyA.position, penetration);
        } else {
          vec3_multiplyScalar(penetration, 0.5);
          vec3_add(bodyA.position, penetration);
          vec3_sub(bodyB.position, penetration);
        }

        // HACK HACK HACK.
        if (bodyA.enemy && !bodyB.enemy && bodyB.health) {
          collisions.hit.push(bodyB);
          collisions.removed.push(bodyA);
          bodyA.physics = false;
        } else if (!bodyA.enemy && bodyA.health && bodyB.enemy) {
          collisions.hit.push(bodyA);
          collisions.removed.push(bodyB);
          bodyB.physics = false;
        }
      }
    }
  }

  return collisions;
}
