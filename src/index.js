/* global c */

import { boxGeom_create } from './boxGeom';
import { bufferGeom_create, bufferGeom_fromGeom } from './bufferGeom';
import { camera_create, camera_lookAt, camera_updateProjectionMatrix } from './camera';
import { directionalLight_create } from './directionalLight';
import { mat4_getInverse, mat4_multiplyMatrices } from './mat4';
import { material_create } from './material';
import { mesh_create } from './mesh';
import { object3d_create, object3d_add, object3d_updateMatrixWorld } from './object3d';
import { quat_setFromEuler } from './quat';
import {
  createShaderProgram,
  setFloat32Attribute,
  setFloatUniform,
  setMat4Uniform,
  setVec3Uniform,
  cacheUniformLocations,
} from './shader';
import {
  vec3_create,
  vec3_multiplyScalar,
  vec3_setFromMatrixPosition,
  vec3_set,
  vec3_sub,
  vec3_transformDirection,
} from './vec3';
import { alignBoxVertices } from './boxAlign';
import { applyBoxVertexColors, applyDefaultVertexColors } from './boxColors';
import { scaleBoxVertices } from './boxTransform';
import playAudio from './audio';

import vs from './shaders/phong_vert.glsl';
import fs from './shaders/phong_frag.glsl';

var boxMaterial = material_create();
vec3_set(boxMaterial.color, 1, 0.4, 0.8);
vec3_set(boxMaterial.specular, 1, 1, 1);

var box = boxGeom_create(1, 1, 1);
alignBoxVertices(box, 'px_py');
box._bufferGeom = bufferGeom_fromGeom(bufferGeom_create(), box);
var mesh = mesh_create(box, boxMaterial);
quat_setFromEuler(mesh.quaternion, vec3_create(0, 0, -Math.PI / 6));

var box2 = boxGeom_create(1, 4, 1);
alignBoxVertices(box2, 'py');
scaleBoxVertices(box2, { py: 0 });
alignBoxVertices(box2, 'px');
applyDefaultVertexColors(box2, [1, 1, 1]);
applyBoxVertexColors(box2, { py: [0.5, 0, 1] });
box2._bufferGeom = bufferGeom_fromGeom(bufferGeom_create(), box2);
var mesh2 = mesh_create(box2, boxMaterial);
mesh2.position.x = 2;

var objects = [mesh, mesh2];

var camera = camera_create(60, window.innerWidth / window.innerHeight);

camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 8;
camera_lookAt(camera, vec3_create());

var light = directionalLight_create(vec3_create(1, 0.5, 0.5));
var directionalLights = [light];

var scene = object3d_create();
object3d_add(scene, mesh);
object3d_add(scene, mesh2);
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

var uniforms = cacheUniformLocations(gl, program, [
  'diffuse',
  'specular',
  'shininess',
  'emissive',
  'modelViewMatrix',
  'projectionMatrix',
  'ambientLightColor',
]);

gl.useProgram(program);

function render(t) {
  t = (t || 0) * 1e-3;

  mesh.position.x = Math.cos(t);
  quat_setFromEuler(mesh.quaternion, vec3_create(0, 0, t + 1));
  light.position.x = Math.cos(t) * 3;
  light.position.z = Math.sin(t) * 3;
  object3d_updateMatrixWorld(scene);
  mat4_getInverse(camera.matrixWorldInverse, camera.matrixWorld);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  setVec3Uniform(gl, uniforms.ambientLightColor, 0.5, 0.5, 0.9);

  directionalLights.map(function(light, index) {
    var _vec3 = vec3_create();

    var direction = vec3_setFromMatrixPosition(vec3_create(), light.matrixWorld);
    vec3_setFromMatrixPosition(_vec3, light.target.matrixWorld);
    vec3_transformDirection(vec3_sub(direction, _vec3), camera.matrixWorldInverse);

    var color = vec3_multiplyScalar(Object.assign(vec3_create(), light.color), light.intensity);

    setVec3Uniform(gl, gl.getUniformLocation(program, 'directionalLights[' + index + '].direction'), direction.x, direction.y, direction.z);
    setVec3Uniform(gl, gl.getUniformLocation(program, 'directionalLights[' + index + '].color'), color.x, color.y, color.z);
  });

  objects.map(function(object) {
    var material = object.material;
    var diffuse = material.color;
    var specular = material.specular;
    var emissive = material.emissive;

    setVec3Uniform(gl, uniforms.diffuse, diffuse.x, diffuse.y, diffuse.z);
    setVec3Uniform(gl, uniforms.specular, specular.x, specular.y, specular.z);
    setFloatUniform(gl, uniforms.shininess, material.shininess);
    setVec3Uniform(gl, uniforms.emissive, emissive.x, emissive.y, emissive.z);

    mat4_multiplyMatrices(object.modelViewMatrix, camera.matrixWorldInverse, object.matrixWorld);

    setMat4Uniform(gl, uniforms.modelViewMatrix, object.modelViewMatrix);
    setMat4Uniform(gl, uniforms.projectionMatrix, camera.projectionMatrix);
    setFloat32Attribute(gl, program, 'position', 3, object.geometry._bufferGeom.attrs.position);
    setFloat32Attribute(gl, program, 'color', 3, object.geometry._bufferGeom.attrs.color);

    gl.drawArrays(gl.TRIANGLES, 0, object.geometry._bufferGeom.attrs.position.length / 3);
  });

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
