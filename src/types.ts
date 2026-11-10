/** Supported model formats. */
export type ModelType = 'splat' | 'obj' | 'fbx' | 'volume';

/** Scene model entry. */
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

/** Volume color presets. */
export type VolumeColorPreset = 'anatomical' | 'viridis' | 'thermal' | 'grayscale';

/** Volume render and clipping state. */
export interface VolumeSettings {
    faces: ClippingBoxFaces;
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
