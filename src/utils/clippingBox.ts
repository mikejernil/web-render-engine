import { Vector3 } from 'three';

import {
    ClippingBoxFaces,
    ClippingFaceControlMetadata,
    VolumeSettings,
    VolumeShapePreset,
} from '../types';
import { DIMENSION, VOXEL_COUNT } from './constants';

const COARSE_GRID_SIZE = 64;
const COARSE_HALF_GRID = COARSE_GRID_SIZE / 2;

const SPHERE_MAX_RADIUS = 0.95;
const TRIG_NOISE_FREQUENCY = 12.0;
const CONCENTRIC_SHELL_FREQUENCY = 10.0;
const CORE_INTENSITY_WEIGHT = 0.55;
const CONCENTRIC_SHELL_WEIGHT = 0.35;
const TRIG_NOISE_WEIGHT = 0.2;

const CUBE_MAX_BOUND = 0.88;
const CUBE_SHELL_THICKNESS = 0.14;
const CUBE_CORE_RADIUS = 0.32;
const CUBE_GYROID_FREQUENCY = 10.0;
const CUBE_SHELL_WEIGHT = 0.65;
const CUBE_GYROID_WEIGHT = 0.35;

/** Default [-1, 1] face bounds. */
export const INITIAL_CLIPPING_BOX_FACES: ClippingBoxFaces = {
    xMinusSideFace: -1.0,
    xPlusSideFace: 1.0,
    yMinusBottomFace: -1.0,
    yPlusTopFace: 1.0,
    zMinusBackFace: -1.0,
    zPlusFrontFace: 1.0,
};

/** Default volume clipping and appearance settings. */
export const INITIAL_VOLUME_SETTINGS: VolumeSettings = {
    faces: { ...INITIAL_CLIPPING_BOX_FACES },
    shapePreset: 'sphere',
    showVolume: true,
    showClippingBox: true,
    showOuterReferenceBox: true,
    densityThreshold: 0.05,
    opacity: 1.0,
    colorPreset: 'anatomical',
};

/** Face slider metadata. */
export const CLIPPING_FACE_CONTROLS_METADATA: ReadonlyArray<ClippingFaceControlMetadata> = [
    {
        faceKey: 'xMinusSideFace',
        displayLabel: 'X- Left',
        boundType: 'minimum',
        pairedFaceKey: 'xPlusSideFace',
    },
    {
        faceKey: 'xPlusSideFace',
        displayLabel: 'X+ Right',
        boundType: 'maximum',
        pairedFaceKey: 'xMinusSideFace',
    },
    {
        faceKey: 'yMinusBottomFace',
        displayLabel: 'Y- Bottom',
        boundType: 'minimum',
        pairedFaceKey: 'yPlusTopFace',
    },
    {
        faceKey: 'yPlusTopFace',
        displayLabel: 'Y+ Top',
        boundType: 'maximum',
        pairedFaceKey: 'yMinusBottomFace',
    },
    {
        faceKey: 'zMinusBackFace',
        displayLabel: 'Z- Back',
        boundType: 'minimum',
        pairedFaceKey: 'zPlusFrontFace',
    },
    {
        faceKey: 'zPlusFrontFace',
        displayLabel: 'Z+ Front',
        boundType: 'maximum',
        pairedFaceKey: 'zMinusBackFace',
    },
];

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

/** Evaluates a single voxel density in [0, 255] for the chosen procedural shape. */
function evaluateProceduralVoxel(
    normalizedX: number,
    normalizedY: number,
    normalizedZ: number,
    shapePreset: VolumeShapePreset,
): number {
    const radialDistance = Math.sqrt(
        normalizedX * normalizedX +
            normalizedY * normalizedY +
            normalizedZ * normalizedZ,
    );

    if (shapePreset === 'cube') {
        const maxAxisDistance = Math.max(
            Math.abs(normalizedX),
            Math.abs(normalizedY),
            Math.abs(normalizedZ),
        );
        if (maxAxisDistance > CUBE_MAX_BOUND) return 0;

        const isOuterFrame = maxAxisDistance >= CUBE_MAX_BOUND - CUBE_SHELL_THICKNESS;
        const isInnerCore = radialDistance <= CUBE_CORE_RADIUS;

        const gyroidWave = Math.abs(
            Math.sin(normalizedX * CUBE_GYROID_FREQUENCY) *
                Math.cos(normalizedY * CUBE_GYROID_FREQUENCY) +
                Math.sin(normalizedY * CUBE_GYROID_FREQUENCY) *
                    Math.cos(normalizedZ * CUBE_GYROID_FREQUENCY) +
                Math.sin(normalizedZ * CUBE_GYROID_FREQUENCY) *
                    Math.cos(normalizedX * CUBE_GYROID_FREQUENCY),
        );

        const baseStructure = isOuterFrame || isInnerCore ? 1.0 : 0.25;
        const combinedDensity =
            baseStructure * CUBE_SHELL_WEIGHT + (gyroidWave / 3.0) * CUBE_GYROID_WEIGHT;

        return Math.min(255, Math.max(0, Math.floor(combinedDensity * 255)));
    }

    if (radialDistance > SPHERE_MAX_RADIUS) return 0;

    const trigNoise =
        Math.sin(normalizedX * TRIG_NOISE_FREQUENCY) *
        Math.cos(normalizedY * TRIG_NOISE_FREQUENCY) *
        Math.sin(normalizedZ * TRIG_NOISE_FREQUENCY);

    const concentricShell = Math.abs(Math.sin(radialDistance * CONCENTRIC_SHELL_FREQUENCY));
    const coreIntensity = 1.0 - radialDistance;

    const combinedDensity =
        coreIntensity * CORE_INTENSITY_WEIGHT +
        concentricShell * CONCENTRIC_SHELL_WEIGHT +
        trigNoise * TRIG_NOISE_WEIGHT;

    return Math.min(255, Math.max(0, Math.floor(combinedDensity * 255)));
}

/** Generates a 256^3 Uint8Array voxel buffer for the selected procedural shape. */
export function createProceduralVolumeVoxels(shapePreset: VolumeShapePreset): Uint8Array {
    const coarseVoxels = new Uint8Array(
        COARSE_GRID_SIZE * COARSE_GRID_SIZE * COARSE_GRID_SIZE,
    );

    for (let z = 0; z < COARSE_GRID_SIZE; z++) {
        const normalizedZ = (z - COARSE_HALF_GRID) / COARSE_HALF_GRID;
        for (let y = 0; y < COARSE_GRID_SIZE; y++) {
            const normalizedY = (y - COARSE_HALF_GRID) / COARSE_HALF_GRID;
            for (let x = 0; x < COARSE_GRID_SIZE; x++) {
                const normalizedX = (x - COARSE_HALF_GRID) / COARSE_HALF_GRID;
                const coarseIndex =
                    z * COARSE_GRID_SIZE * COARSE_GRID_SIZE + y * COARSE_GRID_SIZE + x;
                coarseVoxels[coarseIndex] = evaluateProceduralVoxel(
                    normalizedX,
                    normalizedY,
                    normalizedZ,
                    shapePreset,
                );
            }
        }
    }

    const fullVoxels = new Uint8Array(VOXEL_COUNT);
    const scaleShift = Math.round(Math.log2(DIMENSION / COARSE_GRID_SIZE));
    let writeOffset = 0;

    for (let z = 0; z < DIMENSION; z++) {
        const coarseZOffset = (z >> scaleShift) * COARSE_GRID_SIZE * COARSE_GRID_SIZE;
        for (let y = 0; y < DIMENSION; y++) {
            const coarseZYOffset = coarseZOffset + (y >> scaleShift) * COARSE_GRID_SIZE;
            for (let x = 0; x < DIMENSION; x++) {
                fullVoxels[writeOffset++] = coarseVoxels[coarseZYOffset + (x >> scaleShift)];
            }
        }
    }

    return fullVoxels;
}