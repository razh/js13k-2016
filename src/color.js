export function color_create(r, g, b) {
  return {
    r: r || 0,
    g: g || 0,
    b: b || 0,
  };
}

export function color_copy(a, b) {
  a.r = b.r;
  a.g = b.g;
  a.b = b.b;
  return a;
}

export function color_multiplyScalar(c, scalar) {
  c.r *= scalar;
  c.g *= scalar;
  c.b *= scalar;
  return c;
}
