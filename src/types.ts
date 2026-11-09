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
