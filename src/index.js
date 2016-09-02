/* global c */

import { boxGeom_create } from './boxGeom';
import { bufferGeom_create, bufferGeom_fromGeom } from './bufferGeom';
import { camera_create } from './camera';
import { mat4_getInverse, mat4_multiplyMatrices } from './mat4';
import { mesh_create } from './mesh';
import { object3d_updateMatrix, object3d_updateMatrixWorld } from './object3d';
import { quat_setFromEuler } from './quat';
import { createShaderProgram, setFloat32Attribute, setMat4Uniform } from './shader';
import { vec3_create } from './vec3';

var box = boxGeom_create(1, 1, 1);
var bufferGeom = bufferGeom_fromGeom(bufferGeom_create(), box);
var mesh = mesh_create(box);
quat_setFromEuler(mesh.quaternion, vec3_create(0, 0, -Math.PI / 6));

var camera = camera_create(60, window.innerWidth / window.innerHeight);

camera.position.x = 1;
camera.position.y = 2;
camera.position.z = 8;

object3d_updateMatrix(mesh);
object3d_updateMatrixWorld(mesh);
object3d_updateMatrix(camera);
object3d_updateMatrixWorld(camera);
mat4_getInverse(camera.matrixWorldInverse, camera.matrixWorld);
mat4_multiplyMatrices(mesh.modelViewMatrix, camera.matrixWorldInverse, mesh.matrixWorld);

function render(el) {
  var gl = el.getContext('webgl');
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var program = createShaderProgram(
    gl,

    'precision highp float;' +
    'precision highp int;' +
     // modelViewMatrix
    'uniform mat4 M;' +
    // projectionMatrix
    'uniform mat4 P;' +
    // position
    'attribute vec3 p;' +
    // // normal
    // 'attribute vec3 n;' +
    // // color
    // 'attribute vec3 c;' +
    // // vColor
    // 'varying vec3 vc;' +
    'void main(){' +
      // 'vc = c;' +
      'gl_Position=P*M*vec4(p,1.0);' +
    '}',

    'precision highp float;' +
    'precision highp int;' +
    // 'varying vec3 vc;' +
    'void main(){' +
      // 'gl_FragColor=vec4(vc,1.0);' +
      'gl_FragColor=vec4(1.0);' +
    '}'
  );

  gl.useProgram(program);

  setMat4Uniform(gl, program, 'M', mesh.modelViewMatrix);
  setMat4Uniform(gl, program, 'P', camera.projectionMatrix);
  setFloat32Attribute(gl, program, 'p', 3, bufferGeom.attrs.p);

  gl.drawArrays(gl.TRIANGLES, 0, bufferGeom.attrs.p.length / 3);
}

c.width = window.innerWidth;
c.height = window.innerHeight;
render(c);
