import { object3d_lookAt } from './object3d';
import {
  vec3_create,
  vec3_fromArray,
  vec3_distanceTo,
} from './vec3';
import { tween_create, tween_cancel } from './tween';

export function path_create(object, points, options, callback) {
  vec3_fromArray(object.position, points[0]);

  var target = vec3_create();
  var index = 1;

  function moveTo(index) {
    vec3_fromArray(target, points[index]);
    var distance = vec3_distanceTo(target, object.position);
    object3d_lookAt(object, target);

    var tween = tween_create(
      object.position,
      Object.assign({
        to: target,
        duration: distance / object.speed * 1000,
        update: function() {
          if (!object.parent) {
            tween_cancel(tween);
          }
        },
      }, options),
      function() {
        index++;
        if (points[index]) {
          moveTo(index);
        } else if (callback) {
          callback();
        }
      }
    );

    return tween;
  }

  return moveTo(index);
}
