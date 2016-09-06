// Vertices.
// pz-nz order is reversed for the nx side.
var PX_PY_PZ = 0;
var PX_PY_NZ = 1;
var PX_NY_PZ = 2;
var PX_NY_NZ = 3;
var NX_PY_NZ = 4;
var NX_PY_PZ = 5;
var NX_NY_NZ = 6;
var NX_NY_PZ = 7;

// Edges.
var PX_PY = [PX_PY_PZ, PX_PY_NZ];
var PX_NY = [PX_NY_PZ, PX_NY_NZ];
var NX_PY = [NX_PY_NZ, NX_PY_PZ];
var NX_NY = [NX_NY_NZ, NX_NY_PZ];

var PX_PZ = [PX_PY_PZ, PX_NY_PZ];
var PX_NZ = [PX_PY_NZ, PX_NY_NZ];
var NX_NZ = [NX_PY_NZ, NX_NY_NZ];
var NX_PZ = [NX_PY_PZ, NX_NY_PZ];

var PY_PZ = [PX_PY_PZ, NX_PY_PZ];
var PY_NZ = [PX_PY_NZ, NX_PY_NZ];
var NY_PZ = [PX_NY_PZ, NX_NY_PZ];
var NY_NZ = [PX_NY_NZ, NX_NY_NZ];

// Faces.
var PX = [].concat(PX_PY, PX_NY);
var NX = [].concat(NX_PY, NX_NY);
var PY = [].concat(PX_PY, NX_PY);
var NY = [].concat(PX_NY, NX_NY);
var PZ = [].concat(PX_PZ, NX_PZ);
var NZ = [].concat(PX_NZ, NX_NZ);

export default {
  // Vertices.
  PX_PY_PZ: PX_PY_PZ,
  PX_PY_NZ: PX_PY_NZ,
  PX_NY_PZ: PX_NY_PZ,
  PX_NY_NZ: PX_NY_NZ,
  NX_PY_NZ: NX_PY_NZ,
  NX_PY_PZ: NX_PY_PZ,
  NX_NY_NZ: NX_NY_NZ,
  NX_NY_PZ: NX_NY_PZ,

  // Edges.
  PX_PY: PX_PY,
  PX_NY: PX_NY,
  NX_PY: NX_PY,
  NX_NY: NX_NY,

  PX_PZ: PX_PZ,
  PX_NZ: PX_NZ,
  NX_NZ: NX_NZ,
  NX_PZ: NX_PZ,

  PY_PZ: PY_PZ,
  PY_NZ: PY_NZ,
  NY_PZ: NY_PZ,
  NY_NZ: NY_NZ,

  // Faces.
  PX: PX,
  NX: NX,
  PY: PY,
  NY: NY,
  PZ: PZ,
  NZ: NZ,
};
