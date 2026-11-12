import { Vector3 } from 'three';

import { ClippingBoxFaces, VolumeSettings } from '../types';

/** Default [-1, 1] face bounds. */
export const INITIAL_CLIPPING_BOX_FACES: ClippingBoxFaces = {
    xMinusSideFace: -1.0,
    xPlusSideFace: 1.0,
    yMinusBottomFace: -1.0,
    yPlusTopFace: 1.0,
    zMinusBackFace: -1.0,
    zPlusFrontFace: 1.0,
};

/** Default volume clipping settings. */
export const INITIAL_VOLUME_SETTINGS: VolumeSettings = {
    faces: { ...INITIAL_CLIPPING_BOX_FACES },
    showClippingBox: true,
};

/** 12 edge index pairs for a cube. */
export const BOX_EDGE_INDICES: ReadonlyArray<readonly [number, number]> = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
];

/** Returns the 8 corners of the clipping box. */
export function createVertexListFromFaces(faces: ClippingBoxFaces): Vector3[] {
    const {
        xMinusSideFace,
        xPlusSideFace,
        yMinusBottomFace,
        yPlusTopFace,
        zMinusBackFace,
        zPlusFrontFace,
    } = faces;

    return [
        new Vector3(xMinusSideFace, yMinusBottomFace, zMinusBackFace),
        new Vector3(xPlusSideFace, yMinusBottomFace, zMinusBackFace),
        new Vector3(xPlusSideFace, yPlusTopFace, zMinusBackFace),
        new Vector3(xMinusSideFace, yPlusTopFace, zMinusBackFace),

        new Vector3(xMinusSideFace, yMinusBottomFace, zPlusFrontFace),
        new Vector3(xPlusSideFace, yMinusBottomFace, zPlusFrontFace),
        new Vector3(xPlusSideFace, yPlusTopFace, zPlusFrontFace),
        new Vector3(xMinusSideFace, yPlusTopFace, zPlusFrontFace),
    ];
}

/** Builds line segment positions for the 12 box edges. */
export function createWireframeEdgePositions(faces: ClippingBoxFaces): Float32Array {
    const vertexList = createVertexListFromFaces(faces);
    const edgePositions = new Float32Array(BOX_EDGE_INDICES.length * 6);

    BOX_EDGE_INDICES.forEach(([startIndex, endIndex], edgeIndex) => {
        const start = vertexList[startIndex];
        const end = vertexList[endIndex];
        const offset = edgeIndex * 6;

        edgePositions[offset] = start.x;
        edgePositions[offset + 1] = start.y;
        edgePositions[offset + 2] = start.z;

        edgePositions[offset + 3] = end.x;
        edgePositions[offset + 4] = end.y;
        edgePositions[offset + 5] = end.z;
    });

    return edgePositions;
}
