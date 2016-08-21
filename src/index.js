/* global c */

function render(el) {
  var gl = el.getContext('webgl');
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

c.width = window.innerWidth;
c.height = window.innerHeight;
render(c);
