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
