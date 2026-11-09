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
    createSphereNoiseVolumeTexture,
    createWireframeEdgePositions,
} from '../utils/clippingBox';

/** Props for the `VolumetricObject` component. */
export interface VolumetricObjectProps {
    /** Active clipping bounds and raycasting display settings. */
    settings: VolumeSettings;
}

/** Maps each `VolumeColorPreset` name to its integer uniform index in the fragment shader. */
const COLOR_PRESET_TO_INDEX: Record<VolumeColorPreset, number> = {
    anatomical: 0,
    viridis: 1,
    thermal: 2,
    grayscale: 3,
};

/**
 * Renders the procedural 3D noise volume and its interactive wireframe clipping box
 * inside a React Three Fiber `<Canvas>`.
 */
const VolumetricObject: React.FC<VolumetricObjectProps> = ({ settings }) => {
    const { camera } = useThree();
    const volumeMeshRef = useRef<Mesh>(null);
    const shaderMaterialRef = useRef<ShaderMaterial>(null);

    // Generate the procedural 64^3 3D sphere noise texture once on mount.
    const volumeTexture = useMemo(() => createSphereNoiseVolumeTexture(64), []);

    // Free GPU memory for the 3D texture when the texture instance changes or component unmounts.
    useEffect(() => {
        return () => {
            volumeTexture.dispose();
        };
    }, [volumeTexture]);

    // Rebuild the 12-edge wireframe BufferGeometry whenever any of the 6 clipping faces move.
    const clippingBoxGeometry = useMemo(() => {
        const positions = createWireframeEdgePositions(settings.faces);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        return geometry;
    }, [settings.faces]);

    // Dispose the previous wireframe GL buffer whenever `clippingBoxGeometry` is replaced or unmounts.
    useEffect(() => {
        return () => {
            clippingBoxGeometry.dispose();
        };
    }, [clippingBoxGeometry]);

    // Create the static outer reference cube geometry once on mount.
    const outerReferenceBoxGeometry = useMemo(() => {
        const positions = createWireframeEdgePositions(INITIAL_CLIPPING_BOX_FACES);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        return geometry;
    }, []);

    // Dispose the static outer reference cube geometry on unmount.
    useEffect(() => {
        return () => {
            outerReferenceBoxGeometry.dispose();
        };
    }, [outerReferenceBoxGeometry]);

    // Initialize the shader uniform object once and keep the 3D texture reference bound.
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

    // Synchronize the local-space camera position and clipping box uniforms on every frame.
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

            {settings.showOuterReferenceBox && (
                <lineSegments geometry={outerReferenceBoxGeometry}>
                    <lineBasicMaterial color="#888888" transparent opacity={0.45} />
                </lineSegments>
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
