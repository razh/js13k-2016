/* global c */

import { boxGeom_create } from './boxGeom';
import { bufferGeom_create, bufferGeom_fromGeom } from './bufferGeom';
import { camera_create, camera_updateProjectionMatrix } from './camera';
import { color_create, color_copy, color_multiplyScalar } from './color';
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
} from './shader';
import { vec3_create, vec3_setFromMatrixPosition, vec3_sub, vec3_transformDirection } from './vec3';

import vs from './shaders/phong_vert.glsl';
import fs from './shaders/phong_frag.glsl';

var box = boxGeom_create(1, 1, 1);
box._bufferGeom = bufferGeom_fromGeom(bufferGeom_create(), box);
var mesh = mesh_create(box, material_create());
quat_setFromEuler(mesh.quaternion, vec3_create(0, 0, -Math.PI / 6));

var box2 = boxGeom_create(1, 2, 1);
box2._bufferGeom = bufferGeom_fromGeom(bufferGeom_create(), box2);
var mesh2 = mesh_create(box2, material_create());
mesh2.position.x = 2;

var objects = [mesh, mesh2];

var camera = camera_create(60, window.innerWidth / window.innerHeight);

camera.position.x = 1;
camera.position.y = 2;
camera.position.z = 8;

var light = directionalLight_create(color_create(1, 0.5, 0.5));
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

  setVec3Uniform(gl, program, 'diffuse', 1, 0.4, 0.8);
  setVec3Uniform(gl, program, 'specular', 1, 1, 1);
  setFloatUniform(gl, program, 'shininess', 30);
  setVec3Uniform(gl, program, 'emissive', 0, 0, 0);

  setVec3Uniform(gl, program, 'ambientLightColor', 0.5, 0.5, 0.9);

  directionalLights.map(function(light, index) {
    var _vec3 = vec3_create();

    var direction = vec3_setFromMatrixPosition(vec3_create(), light.matrixWorld);
    vec3_setFromMatrixPosition(_vec3, light.target.matrixWorld);
    vec3_transformDirection(vec3_sub(direction, _vec3), camera.matrixWorldInverse);

    var color = color_multiplyScalar(color_copy(color_create(), light.color), light.intensity);

    setVec3Uniform(gl, program, 'directionalLights[' + index + '].direction', direction.x, direction.y, direction.z);
    setVec3Uniform(gl, program, 'directionalLights[' + index + '].color', color.r, color.g, color.b);
  });

  objects.map(function(object) {
    mat4_multiplyMatrices(object.modelViewMatrix, camera.matrixWorldInverse, object.matrixWorld);

    setMat4Uniform(gl, program, 'modelViewMatrix', object.modelViewMatrix);
    setMat4Uniform(gl, program, 'projectionMatrix', camera.projectionMatrix);
    setFloat32Attribute(gl, program, 'position', 3, object.geometry._bufferGeom.attrs.position);
    setFloat32Attribute(gl, program, 'color', 3, object.geometry._bufferGeom.attrs.color);

    gl.drawArrays(gl.TRIANGLES, 0, object.geometry._bufferGeom.attrs.position.length / 3);
  });

  requestAnimationFrame(render);
}

render();

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
