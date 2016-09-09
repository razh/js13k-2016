export function pointerLock_create(controls, element) {
  var hasPointerLock = (
    'pointerLockElement' in document ||
    'mozPointerLockElement' in document
  );

  if (!hasPointerLock) {
    controls.enabled = true;
    return;
  }

  function onPointerLockChange() {
    controls.enabled = (
      element === document.pointerLockElement |
      element === document.mozPointerLockElement
    );
  }

  document.addEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('mozpointerlockchange', onPointerLockChange);

  element.requestPointerLock = (
    element.requestPointerLock ||
    element.mozRequestPointerLock
  );

  document.addEventListener('click', function() {
    element.requestPointerLock();
  });
}
