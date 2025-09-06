export type ModelType = 'splat' | 'obj' | 'fbx' | 'glb';

export interface Model {
    url: string;
    name: string;
    type: ModelType;
}
