import {
    ClampToEdgeWrapping,
    Data3DTexture,
    LinearFilter,
    RedFormat,
    UnsignedByteType,
    Vector3,
} from 'three';

export interface ClippingBoxFaces {
    xMinusSideFace: number;
    xPlusSideFace: number;
    yMinusBottomFace: number;
    yPlusTopFace: number;
    zMinusBackFace: number;
    zPlusFrontFace: number;
}

export type VolumeColorPreset = 'anatomical' | 'viridis' | 'thermal' | 'grayscale';

export interface VolumeSettings {
    faces: ClippingBoxFaces;
    showVolume: boolean;
    showClippingBox: boolean;
    densityThreshold: number;
    opacity: number;
    colorPreset: VolumeColorPreset;
}

export const INITIAL_CLIPPING_BOX_FACES: ClippingBoxFaces = {
    xMinusSideFace: -1.0,
    xPlusSideFace: 1.0,
    yMinusBottomFace: -1.0,
    yPlusTopFace: 1.0,
    zMinusBackFace: -1.0,
    zPlusFrontFace: 1.0,
};

export const INITIAL_VOLUME_SETTINGS: VolumeSettings = {
    faces: { ...INITIAL_CLIPPING_BOX_FACES },
    showVolume: true,
    showClippingBox: true,
    densityThreshold: 0.15,
    opacity: 0.85,
    colorPreset: 'anatomical',
};

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

export function createVertexListFromFaces(faces: ClippingBoxFaces): Vector3[] {
    const {
        xMinusSideFace,
        xPlusSideFace,
        yMinusBottomFace,
        yPlusTopFace,
        zMinusBackFace,
        zPlusFrontFace,
    } = faces;

    const vertexList: Vector3[] = [
        new Vector3(xMinusSideFace, yMinusBottomFace, zMinusBackFace),
        new Vector3(xPlusSideFace, yMinusBottomFace, zMinusBackFace),
        new Vector3(xPlusSideFace, yPlusTopFace, zMinusBackFace),
        new Vector3(xMinusSideFace, yPlusTopFace, zMinusBackFace),

        new Vector3(xMinusSideFace, yMinusBottomFace, zPlusFrontFace),
        new Vector3(xPlusSideFace, yMinusBottomFace, zPlusFrontFace),
        new Vector3(xPlusSideFace, yPlusTopFace, zPlusFrontFace),
        new Vector3(xMinusSideFace, yPlusTopFace, zPlusFrontFace),
    ];

    return vertexList;
}

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

                if (distanceFromCenter <= 0.95) {
                    const trigNoise =
                        Math.sin(normalizedX * 12.0) *
                        Math.cos(normalizedY * 12.0) *
                        Math.sin(normalizedZ * 12.0);

                    const concentricShell = Math.abs(Math.sin(distanceFromCenter * 10.0));
                    const coreIntensity = 1.0 - distanceFromCenter;

                    const combinedDensity =
                        coreIntensity * 0.55 + concentricShell * 0.35 + trigNoise * 0.2;

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
