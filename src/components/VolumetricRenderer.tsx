import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

import fragmentShader from '../shaders/volume/fragment.glsl';
import vertexShader from '../shaders/volume/vertex.glsl';

export type DataFormat = 'uint8' | 'uint16' | 'uint32' | 'float32';

export interface VolumetricRendererProps {
    volumeData: Uint8Array | Uint16Array | Uint32Array | Float32Array | null;
    format?: DataFormat;
    dimensions?: [number, number, number];
}

type RawTypedArray = Uint8Array | Uint16Array | Uint32Array | Float32Array;

function getMaxValueForFormat(format: DataFormat): number {
    switch (format) {
        case 'uint8': return 255;
        case 'uint16': return 65535;
        case 'uint32': return 4294967295;
        case 'float32': return 1.0;
        default: return 255;
    }
}

function detectFormat(data: RawTypedArray): DataFormat {
    if (data instanceof Uint8Array) return 'uint8';
    if (data instanceof Uint16Array) return 'uint16';
    if (data instanceof Uint32Array) return 'uint32';
    if (data instanceof Float32Array) return 'float32';
    return 'uint8';
}

const VolumetricRenderer = ({
    volumeData,
    format,
    dimensions = [256, 256, 256],
}: VolumetricRendererProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const cameraPosition = useMemo(() => new THREE.Vector3(), []);

    const [dimX, dimY, dimZ] = dimensions;
    const voxelCount = dimX * dimY * dimZ;

    const texture = useMemo(() => {
        if (!volumeData) return null;

        const detectedFormat = format || detectFormat(volumeData);
        const maxValue = getMaxValueForFormat(detectedFormat);

        const data = new Float32Array(voxelCount);
        const srcData = volumeData.subarray(0, voxelCount);

        for (let i = 0; i < srcData.length; i++) {
            data[i] = srcData[i] / maxValue;
        }

        const result = new THREE.Data3DTexture(data, dimX, dimY, dimZ);
        result.format = THREE.RedFormat;
        result.type = THREE.FloatType;
        result.minFilter = THREE.LinearFilter;
        result.magFilter = THREE.LinearFilter;
        result.wrapS = THREE.ClampToEdgeWrapping;
        result.wrapT = THREE.ClampToEdgeWrapping;
        result.wrapR = THREE.ClampToEdgeWrapping;
        result.needsUpdate = true;

        return result;
    }, [volumeData, format, dimX, dimY, dimZ, voxelCount]);

    const uniforms = useMemo(
        () => ({
            uVolumeTexture: { value: null as THREE.Data3DTexture | null },
            u_cameraPosition: { value: new THREE.Vector3() },
            u_stepSize: {
                value: new THREE.Vector3(1.0 / dimX, 1.0 / dimY, 1.0 / dimZ),
            },
        }),
        [dimX, dimY, dimZ],
    );

    useEffect(() => {
        uniforms.uVolumeTexture.value = texture;
        return () => texture?.dispose();
    }, [texture, uniforms]);

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
