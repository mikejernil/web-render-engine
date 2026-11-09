export type ModelType = 'splat' | 'obj' | 'fbx' | 'volume';

export interface Model {
    url: string;
    name: string;
    type: ModelType;
}
