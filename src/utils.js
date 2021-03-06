export function compose() {
  var fns = Array.from(arguments);

  return function(source) {
    return fns.reduce(function(result, fn) {
      return fn(result);
    }, source) ;
  };
}

export function rearg(fn) {
  return function(options) {
    return function(arg) {
      return fn(arg, options);
    };
  };
}

export function rearg3f(fn) {
  return function(x, y, z) {
    return function(arg) {
      return fn(arg, x, y, z);
    };
  };
}

function numericSort(a, b) {
  return a - b;
}

export function removeIndices(array, indices) {
  indices.sort(numericSort);
  var i = indices.length;
  while (i--) {
    array.splice(indices[i], 1);
  }
}

export function remove(array, element) {
  var index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

export function uniq(array) {
  return Array.from(new Set(array));
}
