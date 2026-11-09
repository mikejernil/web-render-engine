import type { ComponentType } from 'react';

export type ModelType = 'splat' | 'obj' | 'fbx' | 'volume';

export interface Model {
    url: string;
    name: string;
    type: ModelType;
}

/** What every render effect gets to draw with. */
export interface RenderFxProps {
    /** One byte per voxel, 256^3 total. */
    voxels: Uint8Array;
}

/** One entry in the Render FX list. */
export interface RenderFx {
    /** Label shown on the effect's button. */
    name: string;
    /** Component that draws the volume. */
    Effect: ComponentType<RenderFxProps>;
}
