import {
    ClampToEdgeWrapping,
    Data3DTexture,
    LinearFilter,
    RedFormat,
    UnsignedByteType,
    Vector3,
} from 'three';

import {
    ClippingBoxFaces,
    ClippingFaceControlMetadata,
    VolumeSettings,
    VolumeShapePreset,
} from '../types';

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

/** Default volume settings. */
export const INITIAL_VOLUME_SETTINGS: VolumeSettings = {
    faces: { ...INITIAL_CLIPPING_BOX_FACES },
    shapePreset: 'sphere',
    showVolume: true,
    showClippingBox: true,
    showOuterReferenceBox: true,
    densityThreshold: 0.15,
    opacity: 0.85,
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

/** Configures wrapping and filtering on a 3D volume texture. */
function configureVolumeTexture(volumeTexture: Data3DTexture): Data3DTexture {
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

/** Generates a 3D noise sphere texture. */
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

    return configureVolumeTexture(new Data3DTexture(voxelData, gridSize, gridSize, gridSize));
}

/** hollow cube texture with an inner core. */
export function createCubeLatticeVolumeTexture(gridSize = 64): Data3DTexture {
    const voxelData = new Uint8Array(gridSize * gridSize * gridSize);
    const halfGrid = gridSize / 2;

    for (let z = 0; z < gridSize; z++) {
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const normalizedX = (x - halfGrid) / halfGrid;
                const normalizedY = (y - halfGrid) / halfGrid;
                const normalizedZ = (z - halfGrid) / halfGrid;

                const maxAxisDistance = Math.max(
                    Math.abs(normalizedX),
                    Math.abs(normalizedY),
                    Math.abs(normalizedZ),
                );
                const radialDistance = Math.sqrt(
                    normalizedX * normalizedX +
                        normalizedY * normalizedY +
                        normalizedZ * normalizedZ,
                );

                let voxelValue = 0;

                if (maxAxisDistance <= CUBE_MAX_BOUND) {
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

                    voxelValue = Math.min(255, Math.max(0, Math.floor(combinedDensity * 255)));
                }

                const voxelIndex = z * gridSize * gridSize + y * gridSize + x;
                voxelData[voxelIndex] = voxelValue;
            }
        }
    }

    return configureVolumeTexture(new Data3DTexture(voxelData, gridSize, gridSize, gridSize));
}

/** Creates the 3D volume texture for the selected shape preset. */
export function createVolumeTextureByShape(
    shapePreset: VolumeShapePreset,
    gridSize = 64,
): Data3DTexture {
    return shapePreset === 'cube'
        ? createCubeLatticeVolumeTexture(gridSize)
        : createSphereNoiseVolumeTexture(gridSize);
}
