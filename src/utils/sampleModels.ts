import { DataFormat, SampleModel } from '../types';
import { DIMENSION, VOXEL_COUNT } from './constants';

const REMOTE_VOLUME_BASE_URL =
    'https://huggingface.co/datasets/notHarshPrajapati/volume-samples/resolve/main';

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

    const blobUrl = URL.createObjectURL(new Blob([voxels as BlobPart]));
    generatedUrlCache.noiseSphere = blobUrl;
    return blobUrl;
}

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

    const blobUrl = URL.createObjectURL(new Blob([voxels as BlobPart]));
    generatedUrlCache.gyroidCube = blobUrl;
    return blobUrl;
}

const createRemoteVolumeSample = (
    id: string,
    name: string,
    fileName: string,
    x: number,
    y: number,
    z: number,
    volumeDataFormat: DataFormat,
): SampleModel => ({
    id: `vol-${id}`,
    name,
    type: 'volume',
    url: `${REMOTE_VOLUME_BASE_URL}/${fileName}`,
    thumbnail: `/Images/vol-${id}.jpg`,
    volumeDimensions: { x, y, z },
    volumeDataFormat,
});

const REMOTE_VOLUME_SAMPLES: SampleModel[] = [
    // uint8
    createRemoteVolumeSample('bonsai', 'Bonsai', 'bonsai_256x256x256_uint8.raw', 256, 256, 256, 'uint8'),
    createRemoteVolumeSample('heptane', 'CSAFE Heptane', 'csafe_heptane_302x302x302_uint8.raw', 302, 302, 302, 'uint8'),
    createRemoteVolumeSample('frog', 'Frog', 'frog_256x256x44_uint8.raw', 256, 256, 44, 'uint8'),
    createRemoteVolumeSample('head', 'Head', 'vis_male_128x256x256_uint8.raw', 128, 256, 256, 'uint8'),
    createRemoteVolumeSample('hydrogen', 'Hydrogen Atom', 'hydrogen_atom_128x128x128_uint8.raw', 128, 128, 128, 'uint8'),
    createRemoteVolumeSample('kingsnake', 'Kingsnake', 'kingsnake_1024x1024x795_uint8.raw', 1024, 1024, 795, 'uint8'),
    createRemoteVolumeSample('lobster', 'Lobster', 'lobster_301x324x56_uint8.raw', 301, 324, 56, 'uint8'),
    createRemoteVolumeSample('marschner', 'Marschner Lobb', 'marschner_lobb_41x41x41_uint8.raw', 41, 41, 41, 'uint8'),
    createRemoteVolumeSample('ventricles', 'MRI Ventricles', 'mri_ventricles_256x256x124_uint8.raw', 256, 256, 124, 'uint8'),
    createRemoteVolumeSample('neghip', 'Neghip', 'neghip_64x64x64_uint8.raw', 64, 64, 64, 'uint8'),
    createRemoteVolumeSample('skull', 'Skull', 'skull_256x256x256_uint8.raw', 256, 256, 256, 'uint8'),
    createRemoteVolumeSample('statue-leg', 'Statue Leg', 'statue_leg_341x341x93_uint8.raw', 341, 341, 93, 'uint8'),
    createRemoteVolumeSample('tooth', 'Tooth', 'tooth_103x94x161_uint8.raw', 103, 94, 161, 'uint8'),
    createRemoteVolumeSample('zeiss', 'Zeiss', 'zeiss_680x680x680_uint8.raw', 680, 680, 680, 'uint8'),

    // uint16
    createRemoteVolumeSample('backpack', 'Backpack', 'backpack_512x512x373_uint16.raw', 512, 512, 373, 'uint16'),
    createRemoteVolumeSample('carp', 'Carp', 'carp_256x256x512_uint16.raw', 256, 256, 512, 'uint16'),
    createRemoteVolumeSample('christmas-tree', 'Christmas Tree', 'christmas_tree_512x499x512_uint16.raw', 512, 499, 512, 'uint16'),
    createRemoteVolumeSample('mrt-angio', 'MRT Angio', 'mrt_angio_416x512x112_uint16.raw', 416, 512, 112, 'uint16'),
    createRemoteVolumeSample('pancreas', 'Pancreas', 'pancreas_240x512x512_int16.raw', 240, 512, 512, 'uint16'),
    createRemoteVolumeSample('present', 'Present', 'present_492x492x442_uint16.raw', 492, 492, 442, 'uint16'),
    createRemoteVolumeSample('prone', 'Colon Prone', 'prone_512x512x463_uint16.raw', 512, 512, 463, 'uint16'),
    createRemoteVolumeSample('stag-beetle', 'Stag Beetle', 'stag_beetle_832x832x494_uint16.raw', 832, 832, 494, 'uint16'),
    createRemoteVolumeSample('stent', 'Stent', 'stent_512x512x174_uint16.raw', 512, 512, 174, 'uint16'),

    // float32
    createRemoteVolumeSample('duct', 'Duct Flow', 'duct_193x194x1000_float32.raw', 193, 194, 1000, 'float32'),
    createRemoteVolumeSample('hcci-oh', 'HCCI OH', 'hcci_oh_560x560x560_float32.raw', 560, 560, 560, 'float32'),
    createRemoteVolumeSample('magnetic', 'Magnetic Reconnection', 'magnetic_reconnection_512x512x512_float32.raw', 512, 512, 512, 'float32'),
    createRemoteVolumeSample('turbulence', 'TACC Turbulence', 'tacc_turbulence_256x256x256_float32.raw', 256, 256, 256, 'float32'),
];

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
        thumbnail: '/Images/vol-engine.jpg',
        volumeDimensions: { x: 256, y: 256, z: 256 },
        volumeDataFormat: 'uint8',
    },
    ...REMOTE_VOLUME_SAMPLES,
    {
        id: 'splat-nike',
        name: 'Nike Shoe',
        type: 'splat',
        url: '/models/nike.splat',
        thumbnail: '/Images/shoe.jpg',
    },
    {
        id: 'splat-plush',
        name: 'Plush',
        type: 'splat',
        url: '/models/Plush.splat',
        thumbnail: '/Images/plush.jpg',
    },
    {
        id: 'obj-chair',
        name: 'Chair',
        type: 'obj',
        url: '/models/Chair.obj',
        thumbnail: '/Images/chair.jpg',
    },
    {
        id: 'obj-fox',
        name: 'Fox',
        type: 'obj',
        url: '/models/Fox.obj',
        thumbnail: '/Images/fox.jpg',
    },
    {
        id: 'fbx-imposter',
        name: 'Imposter',
        type: 'fbx',
        url: '/models/Imposter.fbx',
        thumbnail: '/Images/imposter.jpg',
    },
    {
        id: 'fbx-mazda',
        name: 'Mazda',
        type: 'fbx',
        url: '/models/Mazda.fbx',
        thumbnail: '/Images/Mazda.jpg',
    },
    {
        id: 'glb-duck',
        name: 'Duck',
        type: 'glb',
        url: '/models/duck_model.glb',
        thumbnail: '/Images/Duck.jpg',
    },
    {
        id: 'glb-pikachu',
        name: 'Pikachu',
        type: 'glb',
        url: '/models/Pikachu.glb',
        thumbnail: '/Images/pikachu.jpg',
    },
];