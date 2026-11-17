import { SampleModel } from '../types';
import { DIMENSION, VOXEL_COUNT } from './constants';

const generatedUrlCache: Record<string, string> = {};

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
        id: 'splat-1',
        name: 'Nike Shoe',
        type: 'splat',
        url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat',
        thumbnail: '/assets/splat-1.jpg',
    },
    {
        id: 'splat-2',
        name: 'Sample Splat 2',
        type: 'splat',
        url: '/samples/sample2.splat',
        thumbnail: '/assets/splat-2.jpg',
    },
    {
        id: 'obj-1',
        name: 'Sample OBJ 1',
        type: 'obj',
        url: '/samples/sample1.obj',
        thumbnail: '/assets/obj-1.jpg',
    },
    {
        id: 'obj-2',
        name: 'Sample OBJ 2',
        type: 'obj',
        url: '/samples/sample2.obj',
        thumbnail: '/assets/obj-2.jpg',
    },
    {
        id: 'fbx-1',
        name: 'Sample FBX 1',
        type: 'fbx',
        url: '/samples/sample1.fbx',
        thumbnail: '/assets/fbx-1.jpg',
    },
    {
        id: 'fbx-2',
        name: 'Sample FBX 2',
        type: 'fbx',
        url: '/samples/sample2.fbx',
        thumbnail: '/assets/fbx-2.jpg',
    },
    {
        id: 'vol-1',
        name: 'Sample Volume 1',
        type: 'volume',
        url: '/samples/sample1.raw',
        thumbnail: '/assets/volume-1.jpg',
        volumeDimensions: { x: 256, y: 256, z: 256 },
        volumeDataFormat: 'uint8',
    },
    {
        id: 'vol-2',
        name: 'Sample Volume 2',
        type: 'volume',
        url: '/samples/sample2.raw',
        thumbnail: '/assets/volume-2.jpg',
        volumeDimensions: { x: 256, y: 256, z: 256 },
        volumeDataFormat: 'uint8',
    },
    {
        id: 'vol-sphere',
        name: 'Nested Sphere',
        type: 'volume',
        createUrl: createNestedSphereVolumeUrl,
        thumbnail: '/assets/volume-sphere.jpg',
        volumeDimensions: { x: 256, y: 256, z: 256 },
        volumeDataFormat: 'uint8',
    },
    {
        id: 'vol-cube',
        name: 'Hollow Cube Core',
        type: 'volume',
        createUrl: createHollowCubeVolumeUrl,
        thumbnail: '/assets/volume-cube.jpg',
        volumeDimensions: { x: 256, y: 256, z: 256 },
        volumeDataFormat: 'uint8',
    },
];