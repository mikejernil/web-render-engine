import type { ComponentType } from 'react';

export type ModelType = 'splat' | 'obj' | 'fbx' | 'volume';
export type DataFormat = 'uint8' | 'uint16' | 'uint32' | 'float32';

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

export const isValidDataFormat = (value: unknown): value is DataFormat => {
    return value === 'uint8' || value === 'uint16' || value === 'uint32' || value === 'float32';
};

/** What every render effect gets to draw with. */
export interface RenderFxProps {
    /** One byte per voxel, 256^3 total. */
    voxels: Uint8Array;
    /** Draw mesh effects as lines. */
    wireframe: boolean;
}

/** One entry in the Render FX list. */
export interface RenderFx {
    /** Label shown on the effect's button. */
    name: string;
    /** Component that draws the volume. */
    Effect: ComponentType<RenderFxProps>;
    /** Shows the Wireframe toggle while this effect is picked. */
    hasWireframe?: boolean;
}

/** What every render effect gets to draw with. */
export interface RenderFxProps {
    /** One byte per voxel, 256^3 total. */
    voxels: Uint8Array;
    /** Draw mesh effects as lines. */
    wireframe: boolean;
}

/** One entry in the Render FX list. */
export interface RenderFx {
    /** Label shown on the effect's button. */
    name: string;
    /** Component that draws the volume. */
    Effect: ComponentType<RenderFxProps>;
    /** Shows the Wireframe toggle while this effect is picked. */
    hasWireframe?: boolean;
}
