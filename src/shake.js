import { vec3_set } from './vec3.js';
import { tween_create } from './tween.js';
import { randFloatSpread } from './math.js';

export function shake_create(object, magnitude) {
  var shake = {
    magnitude: magnitude || 0,
  };

  var options = {
    to: {
      magnitude: 0,
    },
    duration: 300,
    update: function() {
      var magnitude = shake.magnitude;

      vec3_set(
        object.position,
        randFloatSpread(magnitude),
        randFloatSpread(magnitude),
        randFloatSpread(magnitude)
      );
    },
  };

  return tween_create(shake, options);
}
