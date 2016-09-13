import { easing_linear } from './easings';
import { removeIndices, remove } from './utils';

var tweens = [];

export function tween_create(object, options, callback) {
  var tween = {
    time: performance.now(),
    object: object,
    start: Object.keys(options.to).reduce(function(start, key) {
      start[key] = object[key];
      return start;
    }, {}),
    to: options.to,
    duration: options.duration,
    easing: options.easing || easing_linear,
    update: options.update,
    callback: callback,
  };

  tweens.push(tween);

  return tween;
}

export function tween_update() {
  var now = performance.now();
  var removedIndices = [];

  tweens.map(function(tween, index) {
    var elapsed = (now - tween.time) / tween.duration;
    var t = Math.min(tween.easing(elapsed), 1);

    Object.keys(tween.to).map(function(key) {
      var start = tween.start[key];
      var end = tween.to[key];

      tween.object[key] = start + (end - start) * t;
    });

    if (tween.update) {
      tween.update(tween);
    }

    if (elapsed > 1) {
      removedIndices.push(index);

      if (tween.callback) {
        tween.callback(tween);
      }
    }
  });

  removeIndices(tweens, removedIndices);
}

export function tween_cancel(tween) {
  remove(tweens, tween);
}

export function tween_clear() {
  tweens = [];
}
