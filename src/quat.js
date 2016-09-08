export function quat_create(x, y, z, w) {
  return {
    x: x || 0,
    y: y || 0,
    z: z || 0,
    w: w !== undefined ? w : 1,
  };
}

export function quat_set(q, x, y, z, w) {
  q.x = x;
  q.y = y;
  q.z = z;
  q.w = w;
  return q;
}

export function quat_copy(a, b) {
  a.x = b.x;
  a.y = b.y;
  a.z = b.z;
  a.w = b.w;
  return a;
}

export function quat_multiply(a, b) {
  // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
  var qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
  var qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

  a.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
  a.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
  a.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
  a.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

  return a;
}

export function quat_setFromAxisAngle(q, axis, angle) {
  var halfAngle = angle / 2;
  var s = Math.sin(halfAngle);

  q.x = axis.x * s;
  q.y = axis.y * s;
  q.z = axis.z * s;
  q.w = Math.cos(halfAngle);

  return q;
}

export function quat_setFromEuler(q, euler) {
  // http://www.mathworks.com/matlabcentral/fileexchange/
  //  20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
  //  content/SpinCalc.m

  var c1 = Math.cos(euler.x / 2);
  var c2 = Math.cos(euler.y / 2);
  var c3 = Math.cos(euler.z / 2);
  var s1 = Math.sin(euler.x / 2);
  var s2 = Math.sin(euler.y / 2);
  var s3 = Math.sin(euler.z / 2);

  q.x = s1 * c2 * c3 + c1 * s2 * s3;
  q.y = c1 * s2 * c3 - s1 * c2 * s3;
  q.z = c1 * c2 * s3 + s1 * s2 * c3;
  q.w = c1 * c2 * c3 - s1 * s2 * s3;

  return q;
}

export function quat_setFromRotationMatrix(q, m) {
  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
  // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

  var m11 = m[0], m12 = m[4], m13 = m[8];
  var m21 = m[1], m22 = m[5], m23 = m[9];
  var m31 = m[2], m32 = m[6], m33 = m[10];

  var trace = m11 + m22 + m33;
  var s;

  if (trace > 0) {
    s = 0.5 / Math.sqrt(trace + 1);

    q.w = 0.25 / s;
    q.x = (m32 - m23) * s;
    q.y = (m13 - m31) * s;
    q.z = (m21 - m12) * s;
  } else if (m11 > m22 && m11 > m33) {
    s = 2 * Math.sqrt(1 + m11 - m22 - m33);

    q.w = (m32 - m23) / s;
    q.x = 0.25 * s;
    q.y = (m12 + m21) / s;
    q.z = (m13 + m31) / s;
  } else if (m22 > m33) {
    s = 2 * Math.sqrt(1 + m22 - m11 - m33);

    q.w = (m13 - m31) / s;
    q.x = (m12 + m21) / s;
    q.y = 0.25 * s;
    q.z = (m23 + m32) / s;
  } else {
    s = 2 * Math.sqrt(1 + m33 - m11 - m22);

    q.w = (m21 - m12) / s;
    q.x = (m13 + m31) / s;
    q.y = (m23 + m32) / s;
    q.z = 0.25 * s;
  }

  return q;
}

export function quat_length(q) {
  return Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
}

export function quat_normalize(q) {
  var l = quat_length(q);

  if (!l) {
    q.x = 0;
    q.y = 0;
    q.z = 0;
    q.w = 1;
  } else {
    l = 1 / l;

    q.x = q.x * l;
    q.y = q.y * l;
    q.z = q.z * l;
    q.w = q.w * l;
  }

  return q;
}

export function quat_slerp(a, b, t) {
  if (!t) {
    return a;
  }

  if (t === 1) {
    return quat_copy(a, b);
  }

  var x = a.x, y = a.y, z = a.z, w = a.w;

  // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

  var cosHalfTheta = w * b.w + x * b.x + y * b.y + z * b.z;

  if (cosHalfTheta < 0) {
    a.w = - b.w;
    a.x = - b.x;
    a.y = - b.y;
    a.z = - b.z;

    cosHalfTheta = - cosHalfTheta;
  } else {
    quat_copy(a, b);
  }

  if (cosHalfTheta >= 1) {
    a.w = w;
    a.x = x;
    a.y = y;
    a.z = z;

    return a;
  }

  var sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);

  if (Math.abs(sinHalfTheta) < 0.001) {
    a.w = 0.5 * (w + a.w);
    a.x = 0.5 * (x + a.x);
    a.y = 0.5 * (y + a.y);
    a.z = 0.5 * (z + a.z);

    return a;
  }

  var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
  var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
  var ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

  a.w = (w * ratioA + a.w * ratioB);
  a.x = (x * ratioA + a.x * ratioB);
  a.y = (y * ratioA + a.y * ratioB);
  a.z = (z * ratioA + a.z * ratioB);

  return a;
}
