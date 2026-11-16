import * as THREE from 'three';

import { CELL_SIZE, CUBE_CORNERS, CUBE_TETRAHEDRA, DIMENSION, ISO_VALUE } from './constants';

/** Makes a buffer twice as big, keeping what is in it. */
const grow = (buffer: Float32Array) => {
    const bigger = new Float32Array(buffer.length * 2);
    bigger.set(buffer);
    return bigger;
};

/**
 * Pulls the iso-surface out of a volume as a plain triangle list.
 * @param voxels One byte per voxel, 256^3 total, x running fastest.
 * @returns Position and normal of every vertex, three floats each, in two arrays.
 */
export const marchTetrahedra = (voxels: Uint8Array) => {
    const values = new Uint8Array(CUBE_CORNERS.length);
    const corners = CUBE_CORNERS.map(() => new THREE.Vector3());
    const gradients = CUBE_CORNERS.map(() => new THREE.Vector3());
    const position = new THREE.Vector3();
    const normal = new THREE.Vector3();

    // room for 1M vertices to start with, doubled whenever it fills up
    let positions = new Float32Array(3 * 1024 * 1024);
    let normals = new Float32Array(positions.length);
    let used = 0;

    const sample = (x: number, y: number, z: number) => {
        const clamp = (value: number) => Math.min(Math.max(value, 0), DIMENSION - 1);
        return voxels[clamp(x) + clamp(y) * DIMENSION + clamp(z) * DIMENSION * DIMENSION];
    };

    // adds the point where the surface crosses the edge between two corners
    const pushVertex = (a: number, b: number) => {
        const t = (ISO_VALUE - values[a]) / (values[b] - values[a]);
        // voxel centres sit half a voxel in, matching the ray marched cube
        position
            .lerpVectors(corners[a], corners[b], t)
            .addScalar(0.5)
            .divideScalar(DIMENSION)
            .subScalar(0.5);
        normal.lerpVectors(gradients[a], gradients[b], t).normalize();

        if (used === positions.length) {
            positions = grow(positions);
            normals = grow(normals);
        }
        position.toArray(positions, used);
        normal.toArray(normals, used);
        used += 3;
    };

    const marchCell = (x: number, y: number, z: number) => {
        let insideCount = 0;
        CUBE_CORNERS.forEach(([dx, dy, dz], i) => {
            values[i] = sample(x + dx * CELL_SIZE, y + dy * CELL_SIZE, z + dz * CELL_SIZE);
            if (values[i] <= ISO_VALUE) insideCount++;
        });

        // the surface can't pass through a cell that is fully on one side of it
        if (insideCount === 0 || insideCount === CUBE_CORNERS.length) return;

        CUBE_CORNERS.forEach(([dx, dy, dz], i) => {
            const cornerX = x + dx * CELL_SIZE;
            const cornerY = y + dy * CELL_SIZE;
            const cornerZ = z + dz * CELL_SIZE;
            corners[i].set(cornerX, cornerY, cornerZ);
            gradients[i].set(
                sample(cornerX - 1, cornerY, cornerZ) - sample(cornerX + 1, cornerY, cornerZ),
                sample(cornerX, cornerY - 1, cornerZ) - sample(cornerX, cornerY + 1, cornerZ),
                sample(cornerX, cornerY, cornerZ - 1) - sample(cornerX, cornerY, cornerZ + 1),
            );
        });

        for (const tetrahedron of CUBE_TETRAHEDRA) {
            const inside = tetrahedron.filter((corner) => values[corner] <= ISO_VALUE);
            const outside = tetrahedron.filter((corner) => values[corner] > ISO_VALUE);

            if (inside.length === 2) {
                // two corners on each side cuts the tetrahedron in a quad
                const [a, b] = inside;
                const [c, d] = outside;
                pushVertex(a, c);
                pushVertex(a, d);
                pushVertex(b, d);
                pushVertex(a, c);
                pushVertex(b, d);
                pushVertex(b, c);
            } else if (inside.length === 1) {
                outside.forEach((corner) => pushVertex(inside[0], corner));
            } else if (outside.length === 1) {
                inside.forEach((corner) => pushVertex(outside[0], corner));
            }
        }
    };

    for (let z = 0; z + CELL_SIZE < DIMENSION; z += CELL_SIZE) {
        for (let y = 0; y + CELL_SIZE < DIMENSION; y += CELL_SIZE) {
            for (let x = 0; x + CELL_SIZE < DIMENSION; x += CELL_SIZE) marchCell(x, y, z);
        }
    }

    return { positions: positions.slice(0, used), normals: normals.slice(0, used) };
};
