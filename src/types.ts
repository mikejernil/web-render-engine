/** Supported 3D and volumetric model file formats. */
export type ModelType = 'splat' | 'obj' | 'fbx' | 'volume';

/** Metadata for a user-loaded scene model. */
export interface Model {
    url: string;
    name: string;
    type: ModelType;
}

/** Normalized [-1, 1] plane offsets for each of the 6 clipping box faces. */
export interface ClippingBoxFaces {
    xMinusSideFace: number;
    xPlusSideFace: number;
    yMinusBottomFace: number;
    yPlusTopFace: number;
    zMinusBackFace: number;
    zPlusFrontFace: number;
}

/** Available transfer-function colormap presets for the placeholder volume. */
export type VolumeColorPreset = 'anatomical' | 'viridis' | 'thermal' | 'grayscale';

/** Interactive state for the volumetric clipping box and raycasting parameters. */
export interface VolumeSettings {
    faces: ClippingBoxFaces;
    showVolume: boolean;
    showClippingBox: boolean;
    showOuterReferenceBox: boolean;
    densityThreshold: number;
    opacity: number;
    colorPreset: VolumeColorPreset;
}

/** Configuration metadata for rendering a clamped clipping-face slider control. */
export interface ClippingFaceControlMetadata {
    faceKey: keyof ClippingBoxFaces;
    displayLabel: string;
    boundType: 'minimum' | 'maximum';
    pairedFaceKey: keyof ClippingBoxFaces;
}
