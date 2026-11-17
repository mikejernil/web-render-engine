import { SampleModel } from '../types';
import { DIMENSION, VOXEL_COUNT } from './constants';

// Cache generated blob URLs to avoid recomputing volumes
const generatedUrlCache: Record<string, string> = {};

/** Generates a 256^3 sphere with internal wave noise. */
function createNoiseSphereVolumeUrl(): string {
    if (generatedUrlCache.noiseSphere) return generatedUrlCache.noiseSphere;

    const voxels = new Uint8Array(VOXEL_COUNT);
    const center = DIMENSION / 2;
    const radius = 96;

    for (let z = 0; z < DIMENSION; z++) {
        const dz = z - center;
        for (let y = 0; y < DIMENSION; y++) {
            const dy = y - center;
            for (let x = 0; x < DIMENSION; x++) {
                const dx = x - center;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < radius) {
                    const wave =
                        Math.sin(x * 0.12) * Math.cos(y * 0.12) +
                        Math.sin(z * 0.12);
                    const falloff = 1 - dist / radius;
                    voxels[x + y * DIMENSION + z * DIMENSION * DIMENSION] =
                        Math.max(0, Math.min(255, Math.round((falloff * 160) + wave * 45)));
                }
            }
        }
    }

    const blobUrl = URL.createObjectURL(new Blob([voxels]));
    generatedUrlCache.noiseSphere = blobUrl;
    return blobUrl;
}

/** Generates a 256^3 procedural gyroid cube volume. */
function createGyroidCubeVolumeUrl(): string {
    if (generatedUrlCache.gyroidCube) return generatedUrlCache.gyroidCube;

    const voxels = new Uint8Array(VOXEL_COUNT);
    const margin = 36;
    const scale = 0.085;

    for (let z = margin; z < DIMENSION - margin; z++) {
        const sz = Math.sin(z * scale);
        const cz = Math.cos(z * scale);
        for (let y = margin; y < DIMENSION - margin; y++) {
            const sy = Math.sin(y * scale);
            const cy = Math.cos(y * scale);
            for (let x = margin; x < DIMENSION - margin; x++) {
                const sx = Math.sin(x * scale);
                const cx = Math.cos(x * scale);

                // Standard gyroid implicit surface equation
                const gyroid = sx * cy + sy * cz + sz * cx;
                if (Math.abs(gyroid) < 0.45) {
                    voxels[x + y * DIMENSION + z * DIMENSION * DIMENSION] = 200;
                }
            }
        }
    }

    const blobUrl = URL.createObjectURL(new Blob([voxels]));
    generatedUrlCache.gyroidCube = blobUrl;
    return blobUrl;
}

// Built-in sample models mapped to public folder assets
export const SAMPLE_MODELS: SampleModel[] = [
    {
        id: 'vol-sphere',
        name: 'Noise Sphere',
        type: 'volume',
        createUrl: createNoiseSphereVolumeUrl,
        thumbnail: '',
        volumeDimensions: { x: 256, y: 256, z: 256 },
        volumeDataFormat: 'uint8',
    },
    {
        id: 'vol-gyroid',
        name: 'Gyroid Cube',
        type: 'volume',
        createUrl: createGyroidCubeVolumeUrl,
        thumbnail: '',
        volumeDimensions: { x: 256, y: 256, z: 256 },
        volumeDataFormat: 'uint8',
    },
    {
        id: 'vol-engine',
        name: 'Engine 256',
        type: 'volume',
        url: '/assets/Engine256.raw',
        thumbnail: '',
        volumeDimensions: { x: 256, y: 256, z: 256 },
        volumeDataFormat: 'uint8',
    },
    {
        id: 'splat-nike',
        name: 'Nike Shoe',
        type: 'splat',
        url: '/models/nike.splat',
        thumbnail: '/Sample/shoe.jpg',
    },
    {
        id: 'splat-plush',
        name: 'Plush',
        type: 'splat',
        url: '/models/Plush.splat',
        thumbnail: '/Sample/plush.jpg',
    },
    {
        id: 'obj-chair',
        name: 'Chair',
        type: 'obj',
        url: '/models/Chair.obj',
        thumbnail: '/Sample/chair.jpg',
    },
    {
        id: 'obj-fox',
        name: 'Fox',
        type: 'obj',
        url: '/models/Fox.obj',
        thumbnail: '/Sample/fox.jpg',
    },
    {
        id: 'fbx-imposter',
        name: 'Imposter',
        type: 'fbx',
        url: '/models/Imposter.fbx',
        thumbnail: '/Sample/imposter.jpg',
    },
    {
        id: 'fbx-mazda',
        name: 'Mazda',
        type: 'fbx',
        url: '/models/Mazda.fbx',
        thumbnail: '/Sample/Mazda.jpg',
    },
    {
        id: 'glb-duck',
        name: 'Duck',
        type: 'glb',
        url: '/models/duck_model.glb',
        thumbnail: '/Sample/Duck.jpg',
    },
    {
        id: 'glb-pikachu',
        name: 'Pikachu',
        type: 'glb',
        url: '/models/Pikachu.glb',
        thumbnail: '/Sample/pikachu.jpg',
    },
];