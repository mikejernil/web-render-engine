import { ComponentType } from 'react';

export type ModelType = 'splat' | 'obj' | 'fbx' | 'volume';

export interface Model {
    url: string;
    name: string;
    type: ModelType;
}

/** Clipping plane bounds in [-1, 1]. */
export interface ClippingBoxFaces {
    xMinusSideFace: number;
    xPlusSideFace: number;
    yMinusBottomFace: number;
    yPlusTopFace: number;
    zMinusBackFace: number;
    zPlusFrontFace: number;
}

/** Volume clipping state. */
export interface VolumeSettings {
    faces: ClippingBoxFaces;
    showClippingBox: boolean;
}

/** What every render effect gets to draw with. */
export interface RenderFxProps {
    /** One byte per voxel, 256^3 total. */
    voxels: Uint8Array;
    /** Draw mesh effects as lines. */
    wireframe?: boolean;
    /** Slider value for the isosurface. */
    isoValue?: number;
    /** Clipping bounds for the volume. */
    volumeSettings: VolumeSettings;
}

/** One entry in the Render FX list. */
export interface RenderFx {
    /** Label shown on the effect's button. */
    name: string;
    /** Component that draws the volume. */
    Effect: ComponentType<RenderFxProps>;
    /** Shows the Wireframe toggle while this effect is picked. */
    hasWireframe?: boolean;
    /** Shows the IsoValue slider while this effect is picked. */
    hasIsoValue?: boolean;
}
