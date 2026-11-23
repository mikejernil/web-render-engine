import { useEffect, useMemo, useRef } from 'react';



import * as THREE from 'three';



import { useFrame } from '@react-three/fiber';



import fragmentShader from '../../shaders/pseudo-isosurface/fragment.glsl';
import vertexShader from '../../shaders/volume/vertex.glsl';
import { RenderFxProps } from '../../types';
import { DIMENSION } from '../../utils/constants';


/** Ray marches the volume inside a unit cube. */
const PseudoIsoSurfaceFx = ({ voxels ,volumeSettings, volumeDimensions}: RenderFxProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    
    const dims = volumeDimensions || { x: 256, y: 256, z: 256 };

    const texture = useMemo(() => {
        const result = new THREE.Data3DTexture(voxels, dims.x, dims.y, dims.z);
        result.format = THREE.RedFormat;
        result.minFilter = THREE.LinearFilter;
        result.magFilter = THREE.LinearFilter;
        result.needsUpdate = true;

        return result;
    }, [voxels,dims.x, dims.y, dims.z]);

    const uniforms = useMemo(
        () => ({
            uVolumeTexture: { value: null as THREE.Data3DTexture | null },
            u_cameraPosition: { value: new THREE.Vector3() },
            u_stepSize: {
                value: new THREE.Vector3(1 / dims.x, 1 / dims.y, 1 / dims.z),
            },
            u_isoValue: { value: 50.0},
        }),
        [dims.x, dims.y, dims.z],
    );

    // Bind the texture to the shader, and free its GPU memory when it changes or on unmount.
    useEffect(() => {
        uniforms.uVolumeTexture.value = texture;
        return () => texture.dispose();
    }, [texture, uniforms]);

    // Every frame, put the camera in the cube's local space so the shader can get ray directions.
    useFrame(({ camera }) => {
        meshRef.current?.worldToLocal(camera.getWorldPosition(uniforms.u_cameraPosition.value));
        uniforms.u_isoValue.value= 50.0;
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

export default PseudoIsoSurfaceFx;