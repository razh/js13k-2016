import { quat_create, quat_set, quat_normalize, quat_multiply } from './quat';

var quat = quat_create();

export function controls_create(object) {
  var controls = {
    object: object,
    speed: 1,
    turnRate: Math.PI / 4,
    sensitivity: 0.002,
    enabled: false,

    onMouseMove: function(event) {
      if (!controls.enabled) {
        return;
      }

      var movementX = event.movementX || event.mozMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || 0;

      var pitch = -movementY * controls.sensitivity;
      var yaw = -movementX * controls.sensitivity;

      quat_normalize(quat_set(quat, pitch, yaw, 0, 1));
      quat_multiply(object.quaternion, quat);
    },
  };

  document.addEventListener('mousemove', controls.onMouseMove);

  return controls;
}

export function controls_dispose(controls) {
  document.removeEventListener('mousemove', controls.onMouseMove);
}
