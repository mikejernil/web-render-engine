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

/** Clipping plane bounds in [-1, 1]. */
export interface ClippingBoxFaces {
    xMinusSideFace: number;
    xPlusSideFace: number;
    yMinusBottomFace: number;
    yPlusTopFace: number;
    zMinusBackFace: number;
    zPlusFrontFace: number;
}

/** Volume color presets. */
export type VolumeColorPreset = 'anatomical' | 'viridis' | 'thermal' | 'grayscale';

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
