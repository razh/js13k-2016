export function easing_linear(t) {
  return t;
}

export function easing_cubic_inout(t) {
  if ((t *= 2) < 1) {
    return 0.5 * t * t * t;
  }

  return 0.5 * ((t -= 2) * t * t + 2);
}

