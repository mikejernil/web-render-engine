import React, { useEffect, useMemo, useRef } from 'react';

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

import clippingFragmentShader from '../shaders/volume/clippingFragment.glsl';
import clippingVertexShader from '../shaders/volume/clippingVertex.glsl';
import { VolumeColorPreset, VolumeSettings } from '../types';
import {
    INITIAL_CLIPPING_BOX_FACES,
    createVolumeTextureByShape,
    createWireframeEdgePositions,
} from '../utils/clippingBox';

/** Props for VolumetricObject. */
export interface VolumetricObjectProps {
    settings: VolumeSettings;
    showHelpers: boolean;
}

const COLOR_PRESET_TO_INDEX: Record<VolumeColorPreset, number> = {
    anatomical: 0,
    viridis: 1,
    thermal: 2,
    grayscale: 3,
};

/** Renders the placeholder volume and wireframe clipping box. */
const VolumetricObject: React.FC<VolumetricObjectProps> = ({ settings, showHelpers }) => {
    const { camera } = useThree();
    const volumeMeshRef = useRef<Mesh>(null);
    const shaderMaterialRef = useRef<ShaderMaterial>(null);

    // Generate 3D texture for the active shape preset
    const volumeTexture = useMemo(
        () => createVolumeTextureByShape(settings.shapePreset, 64),
        [settings.shapePreset],
    );

    // Dispose texture when preset changes or component unmounts
    useEffect(() => {
        if (shaderMaterialRef.current) {
            shaderMaterialRef.current.uniforms.uVolumeTexture.value = volumeTexture;
        }
        return () => volumeTexture.dispose();
    }, [volumeTexture]);

    // Update wireframe geometry when faces change
    const clippingBoxGeometry = useMemo(() => {
        const positions = createWireframeEdgePositions(settings.faces);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        return geometry;
    }, [settings.faces]);

    // Dispose old wireframe geometry
    useEffect(() => {
        return () => clippingBoxGeometry.dispose();
    }, [clippingBoxGeometry]);

    // Static outer reference box geometry
    const outerReferenceBoxGeometry = useMemo(() => {
        const positions = createWireframeEdgePositions(INITIAL_CLIPPING_BOX_FACES);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        return geometry;
    }, []);

    // Dispose outer box geometry on unmount
    useEffect(() => {
        return () => outerReferenceBoxGeometry.dispose();
    }, [outerReferenceBoxGeometry]);

    // Initialize shader uniforms
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
        [],
    );

    // Sync uniforms each frame
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
                        vertexShader={clippingVertexShader}
                        fragmentShader={clippingFragmentShader}
                        uniforms={uniforms}
                        transparent
                        depthWrite={false}
                        side={BackSide}
                    />
                </mesh>
            )}

            {showHelpers && settings.showOuterReferenceBox && (
                <lineSegments geometry={outerReferenceBoxGeometry}>
                    <lineBasicMaterial color="#888888" transparent opacity={0.45} />
                </lineSegments>
            )}

            {showHelpers && settings.showClippingBox && (
                <lineSegments geometry={clippingBoxGeometry}>
                    <lineBasicMaterial color="#00e5ff" />
                </lineSegments>
            )}
        </group>
    );
};

export default VolumetricObject;
