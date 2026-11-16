/** Voxels per side of the volume. */
export const DIMENSION = 256;
/** Voxels in the whole volume. */
export const VOXEL_COUNT = DIMENSION * DIMENSION * DIMENSION;

/** Density the surface is pulled out at, same as the desktop engine. */
export const ISO_VALUE = 48;
/** Voxels per marching cell, so 128 cells a side like the desktop engine. */
export const CELL_SIZE = 2;

/** Where the 8 corners of a cell sit, in cell units. */
export const CUBE_CORNERS = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1],
];

/** Six tetrahedra sharing the 0-6 diagonal, so neighbouring cells line up. */
export const CUBE_TETRAHEDRA = [
    [0, 5, 1, 6],
    [0, 1, 2, 6],
    [0, 2, 3, 6],
    [0, 3, 7, 6],
    [0, 7, 4, 6],
    [0, 4, 5, 6],
];
