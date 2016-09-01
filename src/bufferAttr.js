export function bufferAttr_copyVector3sArray(array, vectors) {
  var offset = 0;

  for (var i = 0; i < vectors.length; i++) {
    var vector = vectors[i];

    array[offset++] = vector.x;
    array[offset++] = vector.y;
    array[offset++] = vector.z;
  }
}
