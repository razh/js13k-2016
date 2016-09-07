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

export function createFloat32Buffer(gl, array) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
  return buffer;
}

export function setFloat32Attribute(gl, location, buffer, size) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

export function setFloatUniform(gl, location, value) {
  gl.uniform1f(location, value);
}

export function setMat4Uniform(gl, location, array) {
  gl.uniformMatrix4fv(location, false, array);
}

export function setVec3Uniform(gl, location, x, y, z) {
  gl.uniform3f(location, x, y, z);
}

export function getAttributeLocations(gl, program) {
  var locations = {};

  var count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

  for (var i = 0; i < count; i++) {
    var attribute = gl.getActiveAttrib(program, i);
    var name = attribute.name;
    locations[name] = gl.getAttribLocation(program, name);
  }

  return locations;
}

export function getUniformLocations(gl, program) {
  var locations = {};

  var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

  for (var i = 0; i < count; i++) {
    var uniform = gl.getActiveUniform(program, i);
    var name = uniform.name;
    locations[name] = gl.getUniformLocation(program, name);
  }

  return locations;
}
