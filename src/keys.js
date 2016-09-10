export function keys_create() {
  var keys = {};

  document.addEventListener('keydown', function(event) {
    keys[event.code] = true;
  });

  document.addEventListener('keyup', function(event) {
    keys[event.code] = false;
  });

  return keys;
}
