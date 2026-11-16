import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import fragmentShader from '../../shaders/volume/fragment.glsl';
import vertexShader from '../../shaders/volume/vertex.glsl';
import { RenderFxProps, VolumeColorPreset } from '../../types';
import { DIMENSION } from '../../utils/constants';

const COLOR_PRESET_TO_INDEX: Record<VolumeColorPreset, number> = {
    anatomical: 0,
    viridis: 1,
    thermal: 2,
    grayscale: 3,
};

/** Ray marches the volume inside a unit cube. */
const RaycastingFx = ({ voxels, volumeSettings }: RenderFxProps) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const texture = useMemo(() => {
        const result = new THREE.Data3DTexture(
            voxels as BufferSource,
            DIMENSION,
            DIMENSION,
            DIMENSION,
        );
        result.format = THREE.RedFormat;
        result.type = THREE.UnsignedByteType;
        result.minFilter = THREE.LinearFilter;
        result.magFilter = THREE.LinearFilter;
        result.wrapS = THREE.ClampToEdgeWrapping;
        result.wrapT = THREE.ClampToEdgeWrapping;
        result.wrapR = THREE.ClampToEdgeWrapping;
        result.unpackAlignment = 1;
        result.needsUpdate = true;
        return result;
    }, [voxels]);

    const uniforms = useMemo(
        () => ({
            uVolumeTexture: { value: null as THREE.Data3DTexture | null },
            u_cameraPosition: { value: new THREE.Vector3() },
            u_stepSize: { value: new THREE.Vector3().setScalar(1 / DIMENSION) },
            u_clipMin: { value: new THREE.Vector3(0, 0, 0) },
            u_clipMax: { value: new THREE.Vector3(1, 1, 1) },
            u_densityThreshold: { value: 0.05 },
            u_opacity: { value: 1.0 },
            u_colorPreset: { value: 0 },
        }),
        [],
    );

    // Bind the texture to the shader, and free its GPU memory when it changes or on unmount.
    useEffect(() => {
        uniforms.uVolumeTexture.value = texture;
        return () => texture.dispose();
    }, [texture, uniforms]);

    // Every frame, put the camera in the cube's local space so the shader can get ray directions.
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
            uniforms.u_colorPreset.value =
                COLOR_PRESET_TO_INDEX[volumeSettings.colorPreset];
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