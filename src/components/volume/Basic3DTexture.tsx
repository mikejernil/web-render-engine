import { useEffect, useMemo, useRef } from 'react';



import * as THREE from 'three';



import { useFrame } from '@react-three/fiber';



import fragmentShader from '../../shaders/3dtextureslicing/fragment.glsl';
import vertexShader from '../../shaders/3dtextureslicing/vertex.glsl';
import { RenderFxProps } from '../../types';
import { DIMENSION } from '../../utils/constants';
import {MAX_SLICE_VERTICES } from '../../utils/constants';
import { SliceVolume_ } from '../../utils/sliceVolume';

let num_slices = 256;

const Basic3DTextureFx = ({voxels,isClickDragging = false}: RenderFxProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const cameraPosition = useMemo(() => new THREE.Vector3(), []);

    const vTextureSlices = useMemo(() => {
        const slices = new Array(512 * 12);

        for (let i = 0; i < slices.length; i++) {
            slices[i] = new THREE.Vector3();
        }

        return slices;
    }, []);

    const viewDirection = useMemo(() => new THREE.Vector3(1.0, 1.0, 1.0), []);


    const texture = useMemo(() => {
        const result = new THREE.Data3DTexture(voxels, DIMENSION, DIMENSION, DIMENSION);
        result.format = THREE.RedFormat;
        result.minFilter = THREE.LinearFilter;
        result.magFilter = THREE.LinearFilter;
        result.needsUpdate = true;

        return result;
    }, [voxels]);

    const uniforms = useMemo(
        () => ({
            uVolumeTexture: { value: null as THREE.Data3DTexture | null },
        }),
        [],
    );

    const boundingBoxGeometry = useMemo(()=>
    {
        const geometry = new THREE.BufferGeometry();
        const positionVertexArray=new Float32Array(MAX_SLICE_VERTICES*3);

        const vao_BoundingBox = new THREE.BufferAttribute(
            positionVertexArray,3
        );

        vao_BoundingBox.setUsage(THREE.DynamicDrawUsage);

        geometry.setAttribute('position',vao_BoundingBox);
        geometry.setDrawRange(0,0);

        return (geometry);
    },[]);


    // Bind the texture to the shader, and free its GPU memory when it changes or on unmount.
    useEffect(() => {
        uniforms.uVolumeTexture.value = texture;

        SliceVolume_(num_slices, viewDirection, boundingBoxGeometry, vTextureSlices);

        return () => texture.dispose();
    }, [texture, uniforms,boundingBoxGeometry]);

    useFrame(({ camera }) =>
    {
        const mesh = meshRef.current;
        camera.getWorldPosition(cameraPosition);
        mesh?.worldToLocal(cameraPosition);
        mesh?.updateMatrixWorld();
        camera.updateMatrix();
        viewDirection.copy(cameraPosition).normalize();

        if (isClickDragging)
           SliceVolume_(num_slices, viewDirection, boundingBoxGeometry, vTextureSlices);

    });

    return (
        <mesh ref={meshRef}
        geometry= {boundingBoxGeometry} 
        >
            <shaderMaterial
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

export default Basic3DTextureFx;