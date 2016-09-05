export function createShaderProgram(gl, vs, fs) {
  var program = gl.createProgram();

  function createShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }

  createShader(gl.VERTEX_SHADER, vs);
  createShader(gl.FRAGMENT_SHADER, fs);

  gl.linkProgram(program);

  return program;
}

export function setFloat32Attribute(gl, program, name, size, array) {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);

  var location = gl.getAttribLocation(program, name);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

export function setFloatUniform(gl, program, name, value) {
  var location = gl.getUniformLocation(program, name);
  gl.uniform1f(location, value);
}

export function setMat4Uniform(gl, program, name, array) {
  var location = gl.getUniformLocation(program, name);
  gl.uniformMatrix4fv(location, false, array);
}

export function setVec3Uniform(gl, program, name, x, y, z) {
  var location = gl.getUniformLocation(program, name);
  gl.uniform3f(location, x, y, z);
}
