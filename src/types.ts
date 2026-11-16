import type { ComponentType } from 'react';

/** Supported 3D and volumetric model formats. */
export type ModelType = 'splat' | 'obj' | 'fbx' | 'glb' | 'volume';

/** Scene model entry. */
export interface Model {
    url: string;
    name: string;
    type: ModelType;
}

/** Sample card metadata for the model selector UI. */
export interface SampleModelItem {
    name: string;
    type: Exclude<ModelType, 'volume'>;
    url: string;
    thumbnail: string;
}

/** Procedural 3D volume shape variations. */
export type VolumeShapePreset = 'sphere' | 'cube';

/** Volume color presets. */
export type VolumeColorPreset = 'anatomical' | 'viridis' | 'thermal' | 'grayscale';

/** Clipping plane bounds in [-1, 1]. */
export interface ClippingBoxFaces {
    xMinusSideFace: number;
    xPlusSideFace: number;
    yMinusBottomFace: number;
    yPlusTopFace: number;
    zMinusBackFace: number;
    zPlusFrontFace: number;
}

/** Volume render and clipping state. */
export interface VolumeSettings {
    faces: ClippingBoxFaces;
    shapePreset: VolumeShapePreset;
    showVolume: boolean;
    showClippingBox: boolean;
    showOuterReferenceBox: boolean;
    densityThreshold: number;
    opacity: number;
    colorPreset: VolumeColorPreset;
}

/** Slider config for a clipping face. */
export interface ClippingFaceControlMetadata {
    faceKey: keyof ClippingBoxFaces;
    displayLabel: string;
    boundType: 'minimum' | 'maximum';
    pairedFaceKey: keyof ClippingBoxFaces;
}

/** What every render effect gets to draw with. */
export interface RenderFxProps {
    /** One byte per voxel, 256^3 total. */
    voxels: Uint8Array;
    /** Draw mesh effects as lines. */
    wireframe: boolean;
    /** Clipping bounds and appearance settings for the volume. */
    volumeSettings?: VolumeSettings;
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