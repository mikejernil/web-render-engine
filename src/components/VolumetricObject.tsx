import React, { useMemo, useRef } from 'react';

import {
    BackSide,
    BufferAttribute,
    BufferGeometry,
    GLSL3,
    Mesh,
    ShaderMaterial,
    Vector3,
} from 'three';

import { useFrame, useThree } from '@react-three/fiber';

import { VOLUME_FRAGMENT_SHADER, VOLUME_VERTEX_SHADER } from '../shaders/volumeShader';
import {
    VolumeColorPreset,
    VolumeSettings,
    createSphereNoiseVolumeTexture,
    createWireframeEdgePositions,
} from '../utils/clippingBox';

interface VolumetricObjectProps {
    settings: VolumeSettings;
}

const COLOR_PRESET_TO_INDEX: Record<VolumeColorPreset, number> = {
    anatomical: 0,
    viridis: 1,
    thermal: 2,
    grayscale: 3,
};

const VolumetricObject: React.FC<VolumetricObjectProps> = ({ settings }) => {
    const { camera } = useThree();
    const volumeMeshRef = useRef<Mesh>(null);
    const shaderMaterialRef = useRef<ShaderMaterial>(null);

    const volumeTexture = useMemo(() => createSphereNoiseVolumeTexture(64), []);

    const clippingBoxGeometry = useMemo(() => {
        const positions = createWireframeEdgePositions(settings.faces);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        return geometry;
    }, [settings.faces]);

    const uniforms = useMemo(
        () => ({
            uVolumeTexture: { value: volumeTexture },
            uCameraPosition: { value: new Vector3() },
            uXMinusSideFace: { value: settings.faces.xMinusSideFace },
            uXPlusSideFace: { value: settings.faces.xPlusSideFace },
            uYMinusBottomFace: { value: settings.faces.yMinusBottomFace },
            uYPlusTopFace: { value: settings.faces.yPlusTopFace },
            uZMinusBackFace: { value: settings.faces.zMinusBackFace },
            uZPlusFrontFace: { value: settings.faces.zPlusFrontFace },
            uDensityThreshold: { value: settings.densityThreshold },
            uOpacity: { value: settings.opacity },
            uColorPreset: { value: COLOR_PRESET_TO_INDEX[settings.colorPreset] },
        }),
        [volumeTexture],
    );

    useFrame(() => {
        if (!shaderMaterialRef.current || !volumeMeshRef.current) return;

        const localCameraPosition = camera.position.clone();
        volumeMeshRef.current.worldToLocal(localCameraPosition);

        const activeUniforms = shaderMaterialRef.current.uniforms;
        activeUniforms.uCameraPosition.value.copy(localCameraPosition);
        activeUniforms.uXMinusSideFace.value = settings.faces.xMinusSideFace;
        activeUniforms.uXPlusSideFace.value = settings.faces.xPlusSideFace;
        activeUniforms.uYMinusBottomFace.value = settings.faces.yMinusBottomFace;
        activeUniforms.uYPlusTopFace.value = settings.faces.yPlusTopFace;
        activeUniforms.uZMinusBackFace.value = settings.faces.zMinusBackFace;
        activeUniforms.uZPlusFrontFace.value = settings.faces.zPlusFrontFace;
        activeUniforms.uDensityThreshold.value = settings.densityThreshold;
        activeUniforms.uOpacity.value = settings.opacity;
        activeUniforms.uColorPreset.value = COLOR_PRESET_TO_INDEX[settings.colorPreset];
    });

    return (
        <group>
            {settings.showVolume && (
                <mesh ref={volumeMeshRef}>
                    <boxGeometry args={[2, 2, 2]} />
                    <shaderMaterial
                        ref={shaderMaterialRef}
                        glslVersion={GLSL3}
                        vertexShader={VOLUME_VERTEX_SHADER}
                        fragmentShader={VOLUME_FRAGMENT_SHADER}
                        uniforms={uniforms}
                        transparent
                        depthWrite={false}
                        side={BackSide}
                    />
                </mesh>
            )}

            {settings.showClippingBox && (
                <lineSegments geometry={clippingBoxGeometry}>
                    <lineBasicMaterial color="#00e5ff" />
                </lineSegments>
            )}
        </group>
    );
};

export default VolumetricObject;
