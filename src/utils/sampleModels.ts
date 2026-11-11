import { SampleModelItem, VolumeShapePreset } from '../types';

/** Two sample models per supported 3D format with their preview thumbnails. */
export const SAMPLE_MODELS: ReadonlyArray<SampleModelItem> = [
    {
        name: 'Nike Shoe',
        type: 'splat',
        url: '/models/nike.splat',
        thumbnail: '/assets/Sample/shoe.jpg',
    },
    {
        name: 'Plush',
        type: 'splat',
        url: '/models/Plush.splat',
        thumbnail: '/assets/Sample/plush.jpg',
    },
    {
        name: 'Chair',
        type: 'obj',
        url: '/models/Chair.obj',
        thumbnail: '/assets/Sample/chair.jpg',
    },
    {
        name: 'Fox',
        type: 'obj',
        url: '/models/Fox.obj',
        thumbnail: '/assets/Sample/fox.jpg',
    },
    {
        name: 'Imposter',
        type: 'fbx',
        url: '/models/Imposter.fbx',
        thumbnail: '/assets/Sample/imposter.jpg',
    },
    {
        name: 'Mazda',
        type: 'fbx',
        url: '/models/Mazda.fbx',
        thumbnail: '/assets/Sample/Mazda.jpg',
    },
    {
        name: 'Pikachu',
        type: 'glb',
        url: '/models/Pikachu.glb',
        thumbnail: '/assets/Sample/pikachu.jpg',
    },
    {
        name: 'Duck',
        type: 'glb',
        url: '/models/duck_model.glb',
        thumbnail: '/assets/Sample/Duck.jpg',
    },
];

/** Procedural volumetric shape variations for the sample selector. */
export const VOLUME_VARIATIONS: ReadonlyArray<{
    id: VolumeShapePreset;
    name: string;
    subtitle: string;
}> = [
    {
        id: 'sphere',
        name: 'Noise Sphere',
        subtitle: 'Concentric shells',
    },
    {
        id: 'cube',
        name: 'Gyroid Cube',
        subtitle: 'Hollow 3D lattice',
    },
];
