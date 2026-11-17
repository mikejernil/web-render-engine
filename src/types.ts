import type { ComponentType } from 'react';

export type ModelType = 'splat' | 'obj' | 'fbx' | 'glb' | 'volume';
export type DataFormat = 'uint8' | 'uint16' | 'uint32' | 'float32';
export type ColorMapPreset = 'anatomical' | 'viridis' | 'thermal' | 'grayscale';

export interface VolumeDimensions {
    x: number;
    y: number;
    z: number;
}

export interface Model {
    url: string;
    name: string;
    type: ModelType;
    volumeDimensions?: VolumeDimensions;
    volumeDataFormat?: DataFormat;
}

export interface SampleModel {
    id: string;
    name: string;
    type: ModelType;
    thumbnail: string;
    url?: string;
    createUrl?: () => string;
    volumeDimensions?: VolumeDimensions;
    volumeDataFormat?: DataFormat;
}

export const isValidDataFormat = (value: unknown): value is DataFormat => {
    return value === 'uint8' || value === 'uint16' || value === 'uint32' || value === 'float32';
};

/** Clipping plane bounds in [-1, 1]. */
export interface ClippingBoxFaces {
    xMinusSideFace: number;
    xPlusSideFace: number;
    yMinusBottomFace: number;
    yPlusTopFace: number;
    zMinusBackFace: number;
    zPlusFrontFace: number;
}

/** Volume rendering and clipping state. */
export interface VolumeSettings {
    faces: ClippingBoxFaces;
    showClippingBox: boolean;
    activeFx: number;
    wireframe: boolean;
    dimensions: VolumeDimensions;
    dataFormat: DataFormat;
    densityThreshold: number;
    opacity: number;
    colorMap: ColorMapPreset;
}

/** What every render effect gets to draw with. */
export interface RenderFxProps {
    voxels: Uint8Array;
    wireframe: boolean;
    volumeSettings?: VolumeSettings;
    volumeDimensions?: VolumeDimensions;
}

/** One entry in the Render FX list. */
export interface RenderFx {
    name: string;
    Effect: ComponentType<RenderFxProps>;
    hasWireframe?: boolean;
}