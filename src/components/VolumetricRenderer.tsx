import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

import fragmentShader from '../shaders/volume/fragment.glsl';
import vertexShader from '../shaders/volume/vertex.glsl';
import { VolumeSettings } from '../types';
import { createWireframeEdgePositions } from '../utils/clippingBox';

/** Voxels per side of the volume. */
const DIMENSION = 256;
const VOXEL_COUNT = DIMENSION * DIMENSION * DIMENSION;

export interface VolumetricRendererProps {
    /** One byte per voxel, 256^3 total. `null` while loading. */
    volumeData: Uint8Array | null;
    volumeSettings: VolumeSettings;
}

/** Ray marches a raw 256^3 volume inside a unit cube. Use inside an R3F `<Canvas>`. */
const VolumetricRenderer = ({ volumeData, volumeSettings }: VolumetricRendererProps) => {
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

    // Build wireframe geometry when clipping faces change.
    const clippingGeometry = useMemo(() => {
        const positions = createWireframeEdgePositions(volumeSettings.faces);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geometry;
    }, [volumeSettings.faces]);

    // Dispose old wireframe geometry on update or unmount.
    useEffect(() => {
        return () => clippingGeometry.dispose();
    }, [clippingGeometry]);

    const uniforms = useMemo(
        () => ({
            uVolumeTexture: { value: null as THREE.Data3DTexture | null },
            u_cameraPosition: { value: new THREE.Vector3() },
            u_stepSize: {
                value: new THREE.Vector3(1 / DIMENSION, 1 / DIMENSION, 1 / DIMENSION),
            },
            u_clipMin: { value: new THREE.Vector3(0, 0, 0) },
            u_clipMax: { value: new THREE.Vector3(1, 1, 1) },
        }),
        [],
    );

    // Bind the current texture to the shader uniform, and free its GPU memory
    // when the data changes or the component unmounts.
    useEffect(() => {
        uniforms.uVolumeTexture.value = texture;
        return () => texture?.dispose();
    }, [texture, uniforms]);

    // Every frame, give the shader the camera position and clipping bounds.
    useFrame(({ camera }) => {
        const mesh = meshRef.current;
        const material = materialRef.current;
        if (!mesh || !material) return;

        camera.getWorldPosition(cameraPosition);
        mesh.worldToLocal(cameraPosition);
        material.uniforms.u_cameraPosition.value.copy(cameraPosition);

        const { faces } = volumeSettings;
        material.uniforms.u_clipMin.value.set(
            (faces.xMinusSideFace + 1) * 0.5,
            (faces.yMinusBottomFace + 1) * 0.5,
            (faces.zMinusBackFace + 1) * 0.5,
        );
        material.uniforms.u_clipMax.value.set(
            (faces.xPlusSideFace + 1) * 0.5,
            (faces.yPlusTopFace + 1) * 0.5,
            (faces.zPlusFrontFace + 1) * 0.5,
        );
    });

    return (
        <group>
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
            {volumeSettings.showClippingBox && (
                <lineSegments geometry={clippingGeometry} scale={0.5}>
                    <lineBasicMaterial color="#00e5ff" />
                </lineSegments>
            )}
        </group>
    );
};

export default VolumetricRenderer;
