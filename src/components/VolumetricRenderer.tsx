import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

import fragmentShader from '../shaders/volume/fragment.glsl';
import vertexShader from '../shaders/volume/vertex.glsl';
import { DataFormat } from '../types';

export interface VolumetricRendererProps {
    volumeData: Uint8Array | Uint16Array | Uint32Array | Float32Array | null;
    dimensions?: [number, number, number];
}

function getMaxValueForFormat(format: DataFormat): number {
    switch (format) {
        case 'uint8':
            return 255;
        case 'uint16':
            return 65535;
        case 'uint32':
            return 4294967295;
        case 'float32':
            return 1.0;
        default:
            return 255;
    }
}

function detectFormat(data: Uint8Array | Uint16Array | Uint32Array | Float32Array): DataFormat {
    if (data instanceof Uint8Array) return 'uint8';
    if (data instanceof Uint16Array) return 'uint16';
    if (data instanceof Uint32Array) return 'uint32';
    if (data instanceof Float32Array) return 'float32';
    return 'uint8';
}

const VolumetricRenderer = ({
    volumeData,
    dimensions = [256, 256, 256],
}: VolumetricRendererProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const cameraPosition = useMemo(() => new THREE.Vector3(), []);

    const [dimX, dimY, dimZ] = dimensions;
    const voxelCount = dimX * dimY * dimZ;

    const texture = useMemo(() => {
        if (!volumeData) return null;

        const detectedFormat = detectFormat(volumeData);
        const srcData = volumeData.subarray(0, voxelCount);

        let textureType: THREE.TextureDataType;
        let textureData: Uint8Array | Uint16Array | Uint32Array | Float32Array;

        switch (detectedFormat) {
            case 'uint8':
                textureType = THREE.UnsignedByteType;
                textureData = srcData as Uint8Array;
                break;
            case 'uint16':
                textureType = THREE.UnsignedShortType;
                textureData = srcData as Uint16Array;
                break;
            case 'uint32':
                textureType = THREE.UnsignedIntType;
                textureData = srcData as Uint32Array;
                break;
            case 'float32':
                textureType = THREE.FloatType;
                textureData = srcData as Float32Array;
                break;
            default:
                textureType = THREE.UnsignedByteType;
                textureData = srcData as Uint8Array;
        }

        const result = new THREE.Data3DTexture(textureData, dimX, dimY, dimZ);
        result.format = THREE.RedFormat;
        result.type = textureType;
        result.minFilter = THREE.LinearFilter;
        result.magFilter = THREE.LinearFilter;
        result.wrapS = THREE.ClampToEdgeWrapping;
        result.wrapT = THREE.ClampToEdgeWrapping;
        result.wrapR = THREE.ClampToEdgeWrapping;
        result.needsUpdate = true;

        return result;
    }, [volumeData, dimX, dimY, dimZ, voxelCount]);

    const uniforms = useMemo(
        () => ({
            uVolumeTexture: { value: null as THREE.Data3DTexture | null },
            u_cameraPosition: { value: new THREE.Vector3() },
            u_stepSize: {
                value: new THREE.Vector3(1.0 / dimX, 1.0 / dimY, 1.0 / dimZ),
            },
            u_maxValue: { value: 255.0 },
        }),
        [dimX, dimY, dimZ],
    );

    // Bind the current texture to the shader uniform, and free its GPU memory
    // when the data changes or the component unmounts.
    useEffect(() => {
        if (!volumeData) return;

        const detectedFormat = detectFormat(volumeData);
        const maxValue = getMaxValueForFormat(detectedFormat);

        uniforms.uVolumeTexture.value = texture;
        uniforms.u_maxValue.value = maxValue;

        return () => texture?.dispose();
    }, [texture, uniforms, volumeData]);

    // Every frame, give the shader the camera position in the cube's local space
    // so it can work out the ray direction for each pixel.
    useFrame(({ camera }) => {
        const mesh = meshRef.current;
        const material = materialRef.current;
        if (!mesh || !material) return;

        camera.getWorldPosition(cameraPosition);
        mesh.worldToLocal(cameraPosition);
        material.uniforms.u_cameraPosition.value.copy(cameraPosition);
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1, 1, 1]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                glslVersion={THREE.GLSL3}
                transparent
                side={THREE.FrontSide}
            />
        </mesh>
    );
};

export default VolumetricRenderer;
