import { SampleModel } from '../types';
import { DIMENSION, VOXEL_COUNT } from './constants';

const generatedUrlCache: Record<string, string> = {};

const svgThumb = (label: string, color: string) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140">
            <rect width="200" height="140" fill="#1e1e24"/>
            <circle cx="100" cy="62" r="34" fill="none" stroke="${color}" stroke-width="5" opacity="0.85"/>
            <circle cx="100" cy="62" r="16" fill="${color}" opacity="0.5"/>
            <text x="100" y="122" font-family="sans-serif" font-size="13" fill="#ffffff" text-anchor="middle">${label}</text>
        </svg>`,
    )}`;

/** Generates a 256^3 nested sphere volume. */
function createNestedSphereVolumeUrl(): string {
    if (generatedUrlCache.sphere) return generatedUrlCache.sphere;

    const voxels = new Uint8Array(VOXEL_COUNT);
    const center = DIMENSION / 2;

    for (let z = 0; z < DIMENSION; z++) {
        const dz = z - center;
        for (let y = 0; y < DIMENSION; y++) {
            const dy = y - center;
            for (let x = 0; x < DIMENSION; x++) {
                const dx = x - center;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                let density = 0;
                if (dist < 45) {
                    density = 220;
                } else if (dist > 65 && dist < 95) {
                    density = 120;
                }

                voxels[x + y * DIMENSION + z * DIMENSION * DIMENSION] = density;
            }
        }
    }

    const blobUrl = URL.createObjectURL(new Blob([voxels]));
    generatedUrlCache.sphere = blobUrl;
    return blobUrl;
}

/** Generates a 256^3 hollow cube frame with a solid core. */
function createHollowCubeVolumeUrl(): string {
    if (generatedUrlCache.cube) return generatedUrlCache.cube;

    const voxels = new Uint8Array(VOXEL_COUNT);
    const center = DIMENSION / 2;

    for (let z = 0; z < DIMENSION; z++) {
        const az = Math.abs(z - center);
        for (let y = 0; y < DIMENSION; y++) {
            const ay = Math.abs(y - center);
            for (let x = 0; x < DIMENSION; x++) {
                const ax = Math.abs(x - center);
                const maxAxis = Math.max(ax, ay, az);
                const minAxis = Math.min(ax, ay, az);

                const isOuterFrame = maxAxis < 95 && maxAxis > 75 && minAxis > 55;
                const isInnerCore = maxAxis < 35;

                voxels[x + y * DIMENSION + z * DIMENSION * DIMENSION] =
                    isInnerCore ? 230 : isOuterFrame ? 150 : 0;
            }
        }
    }

    const blobUrl = URL.createObjectURL(new Blob([voxels]));
    generatedUrlCache.cube = blobUrl;
    return blobUrl;
}

export const SAMPLE_MODELS: SampleModel[] = [
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
    {
        id: 'vol-engine',
        name: 'Engine 256',
        type: 'volume',
        url: '/assets/Engine256.raw',
        thumbnail: svgThumb('Engine 256', '#38bdf8'),
        volumeDimensions: { x: 256, y: 256, z: 256 },
        volumeDataFormat: 'uint8',
    },
    {
        id: 'vol-sphere',
        name: 'Nested Sphere',
        type: 'volume',
        createUrl: createNestedSphereVolumeUrl,
        thumbnail: svgThumb('Nested Sphere', '#f472b6'),
        volumeDimensions: { x: 256, y: 256, z: 256 },
        volumeDataFormat: 'uint8',
    },
    {
        id: 'vol-cube',
        name: 'Hollow Cube',
        type: 'volume',
        createUrl: createHollowCubeVolumeUrl,
        thumbnail: svgThumb('Hollow Cube', '#34d399'),
        volumeDimensions: { x: 256, y: 256, z: 256 },
        volumeDataFormat: 'uint8',
    },
];