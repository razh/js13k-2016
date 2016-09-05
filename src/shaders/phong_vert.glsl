precision highp float;
precision highp int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
varying vec3 vViewPosition;

#ifdef USE_COLOR
  attribute vec3 color;
  varying vec3 vColor;
#endif

void main() {
  #ifdef USE_COLOR
    vColor.rgb = color.rgb;
  #endif

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  vViewPosition = -mvPosition.xyz;
}
