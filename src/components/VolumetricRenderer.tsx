import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

import fragmentShader from '../shaders/volume/fragment.glsl';
import vertexShader from '../shaders/volume/vertex.glsl';

/** Voxels per side of the volume. Input data is always treated as a cube of this size. */
const DIMENSION = 256;

/** Total number of voxels (one byte each) in the volume texture. */
const VOXEL_COUNT = DIMENSION * DIMENSION * DIMENSION;

/** Props for {@link VolumetricRenderer}. */
export interface VolumetricRendererProps {
    /**
     * Raw volume bytes, one unsigned byte per voxel, x varying fastest.
     * Extra bytes beyond 256^3 are ignored and missing bytes are left as zero.
     * Pass `null` while the data is still loading to render nothing.
     */
    volumeData: Uint8Array | null;
}

/**
 * Renders a raw 256^3 volume by ray marching a 3D texture inside a unit cube.
 *
 * Must be used inside an R3F `<Canvas>`. The shaders live in `src/shaders/volume`.
 *
 * @param props - See {@link VolumetricRendererProps}.
 */
const VolumetricRenderer = ({ volumeData }: VolumetricRendererProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const cameraPosition = useMemo(() => new THREE.Vector3(), []);

    const texture = useMemo(() => {
        if (!volumeData) return null;

        // fixed 256^3 buffer: extra bytes are cut off, missing bytes stay zero
        const data = new Uint8Array(VOXEL_COUNT);
        data.set(volumeData.subarray(0, VOXEL_COUNT));

        const result = new THREE.Data3DTexture(data, DIMENSION, DIMENSION, DIMENSION);
        result.format = THREE.RedFormat;
        result.type = THREE.UnsignedByteType;
        result.minFilter = THREE.LinearFilter;
        result.magFilter = THREE.LinearFilter;
        result.wrapS = THREE.ClampToEdgeWrapping;
        result.wrapT = THREE.ClampToEdgeWrapping;
        result.wrapR = THREE.ClampToEdgeWrapping;
        result.needsUpdate = true;

        return result;
    }, [volumeData]);

    const uniforms = useMemo(
        () => ({
            uVolumeTexture: { value: null as THREE.Data3DTexture | null },
            u_cameraPosition: { value: new THREE.Vector3() },
            u_stepSize: {
                value: new THREE.Vector3(1 / DIMENSION, 1 / DIMENSION, 1 / DIMENSION),
            },
        }),
        [],
    );

    // Bind the current texture to the shader uniform, and free its GPU memory
    // when the data changes or the component unmounts.
    useEffect(() => {
        uniforms.uVolumeTexture.value = texture;
        return () => texture?.dispose();
    }, [texture, uniforms]);

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
