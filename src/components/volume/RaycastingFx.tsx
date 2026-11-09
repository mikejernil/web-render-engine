import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

import fragmentShader from '../../shaders/volume/fragment.glsl';
import vertexShader from '../../shaders/volume/vertex.glsl';
import { RenderFxProps } from '../../types';
import { DIMENSION } from '../../utils/constants';

/** Ray marches the volume inside a unit cube. */
const RaycastingFx = ({ voxels }: RenderFxProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const cameraPosition = useMemo(() => new THREE.Vector3(), []);

    const texture = useMemo(() => {
        const result = new THREE.Data3DTexture(voxels, DIMENSION, DIMENSION, DIMENSION);
        result.format = THREE.RedFormat;
        result.type = THREE.UnsignedByteType;
        result.minFilter = THREE.LinearFilter;
        result.magFilter = THREE.LinearFilter;
        result.wrapS = THREE.ClampToEdgeWrapping;
        result.wrapT = THREE.ClampToEdgeWrapping;
        result.wrapR = THREE.ClampToEdgeWrapping;
        result.needsUpdate = true;

        return result;
    }, [voxels]);

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
        return () => texture.dispose();
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

export default RaycastingFx;
