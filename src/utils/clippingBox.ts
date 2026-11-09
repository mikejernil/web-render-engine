import {
    ClampToEdgeWrapping,
    Data3DTexture,
    LinearFilter,
    RedFormat,
    UnsignedByteType,
    Vector3,
} from 'three';

import { ClippingBoxFaces, ClippingFaceControlMetadata, VolumeSettings } from '../types';

/** Maximum normalized radius of the procedural volume sphere. */
const SPHERE_MAX_RADIUS = 0.95;

/** Spatial frequency multiplier for trigonometric 3D noise. */
const TRIG_NOISE_FREQUENCY = 12.0;

/** Spatial frequency multiplier for concentric spherical shells. */
const CONCENTRIC_SHELL_FREQUENCY = 10.0;

/** Blending weight for the radial core intensity. */
const CORE_INTENSITY_WEIGHT = 0.55;

/** Blending weight for the concentric shell rings. */
const CONCENTRIC_SHELL_WEIGHT = 0.35;

/** Blending weight for the trigonometric noise pattern. */
const TRIG_NOISE_WEIGHT = 0.2;

/** Default unclipped [-1, 1] bounds for all 6 faces of the clipping cube. */
export const INITIAL_CLIPPING_BOX_FACES: ClippingBoxFaces = {
    xMinusSideFace: -1.0,
    xPlusSideFace: 1.0,
    yMinusBottomFace: -1.0,
    yPlusTopFace: 1.0,
    zMinusBackFace: -1.0,
    zPlusFrontFace: 1.0,
};

/** Default volumetric render and clipping settings. */
export const INITIAL_VOLUME_SETTINGS: VolumeSettings = {
    faces: { ...INITIAL_CLIPPING_BOX_FACES },
    showVolume: true,
    showClippingBox: true,
    showOuterReferenceBox: true,
    densityThreshold: 0.15,
    opacity: 0.85,
    colorPreset: 'anatomical',
};

/** Slider metadata pairing each minimum face with its opposing maximum face for clamping. */
export const CLIPPING_FACE_CONTROLS_METADATA: ReadonlyArray<ClippingFaceControlMetadata> = [
    {
        faceKey: 'xMinusSideFace',
        displayLabel: 'X- Left Face',
        boundType: 'minimum',
        pairedFaceKey: 'xPlusSideFace',
    },
    {
        faceKey: 'xPlusSideFace',
        displayLabel: 'X+ Right Face',
        boundType: 'maximum',
        pairedFaceKey: 'xMinusSideFace',
    },
    {
        faceKey: 'yMinusBottomFace',
        displayLabel: 'Y- Bottom Face',
        boundType: 'minimum',
        pairedFaceKey: 'yPlusTopFace',
    },
    {
        faceKey: 'yPlusTopFace',
        displayLabel: 'Y+ Top Face',
        boundType: 'maximum',
        pairedFaceKey: 'yMinusBottomFace',
    },
    {
        faceKey: 'zMinusBackFace',
        displayLabel: 'Z- Back Face',
        boundType: 'minimum',
        pairedFaceKey: 'zPlusFrontFace',
    },
    {
        faceKey: 'zPlusFrontFace',
        displayLabel: 'Z+ Front Face',
        boundType: 'maximum',
        pairedFaceKey: 'zMinusBackFace',
    },
];

/** Vertex index pairs defining the 12 wireframe edges of an 8-corner hexahedron. */
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

/**
 * Computes the 8 corner vertices of the clipping box from its 6 axis-aligned face bounds.
 *
 * @param faces - Current normalized positions of the 6 clipping planes.
 * @returns Array of 8 Three.js `Vector3` corner positions (4 back-face, 4 front-face).
 */
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

/**
 * Builds a flat `Float32Array` of line-segment vertex coordinates for the 12 box edges.
 *
 * @param faces - Current normalized positions of the 6 clipping planes.
 * @returns `Float32Array` of 72 floats (12 edges * 2 vertices * 3 coordinates).
 */
export function createWireframeEdgePositions(faces: ClippingBoxFaces): Float32Array {
    const vertexList = createVertexListFromFaces(faces);
    const edgePositions = new Float32Array(BOX_EDGE_INDICES.length * 6);

    BOX_EDGE_INDICES.forEach(([startIndex, endIndex], edgeNumber) => {
        const startVertex = vertexList[startIndex];
        const endVertex = vertexList[endIndex];
        const offset = edgeNumber * 6;

        edgePositions[offset] = startVertex.x;
        edgePositions[offset + 1] = startVertex.y;
        edgePositions[offset + 2] = startVertex.z;

        edgePositions[offset + 3] = endVertex.x;
        edgePositions[offset + 4] = endVertex.y;
        edgePositions[offset + 5] = endVertex.z;
    });

    return edgePositions;
}

/**
 * Generates a procedural 3D `Data3DTexture` containing a multi-layered noisy sphere.
 *
 * @param gridSize - Voxel resolution along each axis (defaults to 64).
 * @returns Configured Three.js `Data3DTexture` ready for raymarching.
 */
export function createSphereNoiseVolumeTexture(gridSize = 64): Data3DTexture {
    const voxelData = new Uint8Array(gridSize * gridSize * gridSize);
    const halfGrid = gridSize / 2;

    for (let z = 0; z < gridSize; z++) {
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const normalizedX = (x - halfGrid) / halfGrid;
                const normalizedY = (y - halfGrid) / halfGrid;
                const normalizedZ = (z - halfGrid) / halfGrid;

                const distanceFromCenter = Math.sqrt(
                    normalizedX * normalizedX +
                        normalizedY * normalizedY +
                        normalizedZ * normalizedZ,
                );

                let voxelValue = 0;

                if (distanceFromCenter <= SPHERE_MAX_RADIUS) {
                    const trigNoise =
                        Math.sin(normalizedX * TRIG_NOISE_FREQUENCY) *
                        Math.cos(normalizedY * TRIG_NOISE_FREQUENCY) *
                        Math.sin(normalizedZ * TRIG_NOISE_FREQUENCY);

                    const concentricShell = Math.abs(
                        Math.sin(distanceFromCenter * CONCENTRIC_SHELL_FREQUENCY),
                    );
                    const coreIntensity = 1.0 - distanceFromCenter;

                    const combinedDensity =
                        coreIntensity * CORE_INTENSITY_WEIGHT +
                        concentricShell * CONCENTRIC_SHELL_WEIGHT +
                        trigNoise * TRIG_NOISE_WEIGHT;

                    voxelValue = Math.min(255, Math.max(0, Math.floor(combinedDensity * 255)));
                }

                const voxelIndex = z * gridSize * gridSize + y * gridSize + x;
                voxelData[voxelIndex] = voxelValue;
            }
        }
    }

    const volumeTexture = new Data3DTexture(voxelData, gridSize, gridSize, gridSize);
    volumeTexture.format = RedFormat;
    volumeTexture.type = UnsignedByteType;
    volumeTexture.minFilter = LinearFilter;
    volumeTexture.magFilter = LinearFilter;
    volumeTexture.wrapS = ClampToEdgeWrapping;
    volumeTexture.wrapT = ClampToEdgeWrapping;
    volumeTexture.wrapR = ClampToEdgeWrapping;
    volumeTexture.unpackAlignment = 1;
    volumeTexture.needsUpdate = true;

    return volumeTexture;
}
