import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

import fragmentShader from '../../shaders/volume/fragment.glsl';
import vertexShader from '../../shaders/volume/vertex.glsl';
import { ColorMapPreset, RenderFxProps } from '../../types';

const COLOR_MAP_INDEX: Record<ColorMapPreset, number> = {
    anatomical: 0,
    viridis: 1,
    thermal: 2,
    grayscale: 3,
};

/** Ray marches the volume inside a unit cube. */
const RaycastingFx = ({ voxels, volumeSettings, volumeDimensions }: RenderFxProps) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const dims = volumeDimensions || { x: 256, y: 256, z: 256 };

    const texture = useMemo(() => {
        const result = new THREE.Data3DTexture(voxels, dims.x, dims.y, dims.z);
        result.format = THREE.RedFormat;
        result.minFilter = THREE.LinearFilter;
        result.magFilter = THREE.LinearFilter;
        result.needsUpdate = true;
        return result;
    }, [voxels, dims.x, dims.y, dims.z]);

    const uniforms = useMemo(
        () => ({
            uVolumeTexture: { value: null as THREE.Data3DTexture | null },
            u_cameraPosition: { value: new THREE.Vector3() },
            u_stepSize: {
                value: new THREE.Vector3(1 / dims.x, 1 / dims.y, 1 / dims.z),
            },
            u_clipMin: { value: new THREE.Vector3(0, 0, 0) },
            u_clipMax: { value: new THREE.Vector3(1, 1, 1) },
            u_densityThreshold: { value: 0.05 },
            u_opacity: { value: 1.0 },
            u_colorMap: { value: 0 },
        }),
        [dims.x, dims.y, dims.z],
    );

    useEffect(() => {
        uniforms.uVolumeTexture.value = texture;
        return () => texture.dispose();
    }, [texture, uniforms]);

    useFrame(({ camera }) => {
        meshRef.current?.worldToLocal(camera.getWorldPosition(uniforms.u_cameraPosition.value));

        if (volumeSettings) {
            const { faces } = volumeSettings;
            uniforms.u_clipMin.value.set(
                (faces.xMinusSideFace + 1) * 0.5,
                (faces.yMinusBottomFace + 1) * 0.5,
                (faces.zMinusBackFace + 1) * 0.5,
            );
            uniforms.u_clipMax.value.set(
                (faces.xPlusSideFace + 1) * 0.5,
                (faces.yPlusTopFace + 1) * 0.5,
                (faces.zPlusFrontFace + 1) * 0.5,
            );
            uniforms.u_densityThreshold.value = volumeSettings.densityThreshold;
            uniforms.u_opacity.value = volumeSettings.opacity;
            uniforms.u_colorMap.value = COLOR_MAP_INDEX[volumeSettings.colorMap];
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                glslVersion={THREE.GLSL3}
                transparent
            />
        </mesh>
    );
};

export default RaycastingFx;