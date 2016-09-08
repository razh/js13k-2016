/* global c */

import { boxGeom_create } from './boxGeom';
import { bufferGeom_create, bufferGeom_fromGeom } from './bufferGeom';
import { camera_create, camera_lookAt, camera_updateProjectionMatrix } from './camera';
import { cylinderGeom_create } from './cylinderGeom';
import { directionalLight_create } from './directionalLight';
import { mat4_getInverse, mat4_multiplyMatrices } from './mat4';
import { material_create } from './material';
import { mesh_create } from './mesh';
import { object3d_create, object3d_add, object3d_updateMatrixWorld } from './object3d';
import { quat_setFromEuler } from './quat';
import {
  createShaderProgram,
  createFloat32Buffer,
  setFloat32Attribute,
  setFloatUniform,
  setMat4Uniform,
  setVec3Uniform,
  getAttributeLocations,
  getUniformLocations,
} from './shader';
import {
  vec3_create,
  vec3_multiplyScalar,
  vec3_setFromMatrixPosition,
  vec3_set,
  vec3_sub,
  vec3_transformDirection,
} from './vec3';
import { align } from './boxAlign';
import { colors, defaultColors } from './boxColors';
import { scale } from './boxTransform';
import { worm_create } from './worm';
import { controls_create } from './controls';
import { compose } from './utils';
import playAudio from './audio';

import vs from './shaders/phong_vert.glsl';
import fs from './shaders/phong_frag.glsl';

var boxMaterial = material_create();
vec3_set(boxMaterial.color, 1, 0.4, 0.8);
vec3_set(boxMaterial.specular, 1, 1, 1);

var box = boxGeom_create(1, 1, 1);
align('px_py')(box);
var mesh = mesh_create(box, boxMaterial);
quat_setFromEuler(mesh.quaternion, vec3_create(0, 0, -Math.PI / 6));

var box2 = boxGeom_create(1, 4, 1);
compose(
  align('py'),
  scale({ py: 0 }),
  align('px'),
  defaultColors([1, 1, 1]),
  colors({ py: [0.5, 0, 1] })
)(box2);
var mesh2 = mesh_create(box2, boxMaterial);
mesh2.position.x = 2;

var group = object3d_create();
var boxCount = 144;
group.position.x = -Math.sqrt(boxCount) / 2;
group.position.z = -Math.sqrt(boxCount) / 2;
for (var i = 0; i < boxCount; i++) {
  var box3 = boxGeom_create(0.75, 0.2, 0.75);
  compose(
    defaultColors([1, 1, 1]),
    colors({ ny: [0.5, 0, 0.7] })
  )(box3);
  var mesh3 = mesh_create(box3, boxMaterial);
  mesh3.position.x = Math.floor(i / Math.sqrt(boxCount));
  mesh3.position.z = i % Math.sqrt(boxCount);
  object3d_add(group, mesh3);
}

var cylinder = cylinderGeom_create(1, 1, 4, 8, 1);
var mesh4 = mesh_create(cylinder, boxMaterial);

var worm = worm_create(8, 0.5, 0.5, 1, 0.2);

var camera = camera_create(60, window.innerWidth / window.innerHeight);
vec3_set(camera.position, 4, 2, 8);
camera_lookAt(camera, vec3_create());
controls_create(camera);

var ambientLightColor = vec3_create(0.5, 0.5, 0.9);

var light = directionalLight_create(vec3_create(1, 0.5, 0.5));
var directionalLights = [light];

var scene = object3d_create();
object3d_add(scene, mesh);
object3d_add(scene, mesh2);
object3d_add(scene, group);
object3d_add(scene, mesh4);
object3d_add(scene, worm);
object3d_add(scene, camera);
object3d_add(scene, light);

c.width = window.innerWidth;
c.height = window.innerHeight;

var gl = c.getContext('webgl');
gl.clearColor(0, 0, 0, 0);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.getExtension('OES_standard_derivatives');

var program = createShaderProgram(gl, vs, fs);

var attributes = getAttributeLocations(gl, program);
var uniforms = getUniformLocations(gl, program);

gl.useProgram(program);

function setFloat32AttributeBuffer(name, location, bufferGeom, size) {
  var buffer = (
    bufferGeom.buffers[name] ||
    (bufferGeom.buffers[name] = createFloat32Buffer(gl, bufferGeom.attrs[name]))
  );

  setFloat32Attribute(gl, location, buffer, size);
}

function renderObject(object) {
  if (object.geometry && object.material) {
    var geometry = object.geometry;
    var material = object.material;

    setVec3Uniform(gl, uniforms.diffuse, material.color);
    setVec3Uniform(gl, uniforms.specular, material.specular);
    setFloatUniform(gl, uniforms.shininess, material.shininess);
    setVec3Uniform(gl, uniforms.emissive, material.emissive);

    mat4_multiplyMatrices(object.modelViewMatrix, camera.matrixWorldInverse, object.matrixWorld);

    setMat4Uniform(gl, uniforms.modelViewMatrix, object.modelViewMatrix);
    setMat4Uniform(gl, uniforms.projectionMatrix, camera.projectionMatrix);

    if (!geometry._bufferGeom) {
      geometry._bufferGeom = bufferGeom_fromGeom(bufferGeom_create(), geometry);
    }

    setFloat32AttributeBuffer('position', attributes.position, geometry._bufferGeom, 3);
    setFloat32AttributeBuffer('color', attributes.color, geometry._bufferGeom, 3);

    gl.drawArrays(gl.TRIANGLES, 0, geometry._bufferGeom.attrs.position.length / 3);
  }

  object.children.map(renderObject);
}

function render(t) {
  t = (t || 0) * 1e-3;

  mesh.position.x = Math.cos(t);
  quat_setFromEuler(mesh.quaternion, vec3_create(0, 0, t + 1));
  light.position.x = Math.cos(t) * 3;
  light.position.z = Math.sin(t) * 3;
  object3d_updateMatrixWorld(scene);
  mat4_getInverse(camera.matrixWorldInverse, camera.matrixWorld);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  setVec3Uniform(gl, uniforms.ambientLightColor, ambientLightColor);

  directionalLights.map(function(light, index) {
    var _vec3 = vec3_create();

    var direction = vec3_setFromMatrixPosition(vec3_create(), light.matrixWorld);
    vec3_setFromMatrixPosition(_vec3, light.target.matrixWorld);
    vec3_transformDirection(vec3_sub(direction, _vec3), camera.matrixWorldInverse);

    var color = vec3_multiplyScalar(Object.assign(vec3_create(), light.color), light.intensity);

    setVec3Uniform(gl, uniforms['directionalLights[' + index + '].direction'], direction);
    setVec3Uniform(gl, uniforms['directionalLights[' + index + '].color'], color);
  });

  scene.children.map(renderObject);

  requestAnimationFrame(render);
}

render();
playAudio();

function setSize(width, height) {
  c.width = width;
  c.height = height;
  gl.viewport(0, 0, width, height);
}

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera_updateProjectionMatrix(camera);

  setSize(window.innerWidth, window.innerHeight);
});
