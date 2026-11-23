import { useEffect, useMemo, useRef } from 'react';



import * as THREE from 'three';



import { useFrame } from '@react-three/fiber';



import fragmentShader from '../../shaders/pseudo-isosurface/fragment.glsl';
import vertexShader from '../../shaders/volume/vertex.glsl';
import { RenderFxProps } from '../../types';


/** Ray marches the volume inside a unit cube. */
const PseudoIsoSurfaceFx = ({ voxels ,volumeSettings, volumeDimensions}: RenderFxProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    
    const dims = volumeDimensions || { x: 256, y: 256, z: 256 };
    const boxClipping = volumeSettings.faces;
    
    const MAX_SLICES = 512;
    const MAX_SLICE_VERTICES = MAX_SLICES *12;

    const IsoValue: number = volumeSettings.isoValue/255.0;


    function UpdateVertexBuffer(geometry_:THREE.BufferGeometry)
    {
        //const vertices = new Float32Array(
        //[
        //    // Minus Z - vertices
        //    -0.5, -0.5, -0.5,
        //    0.5, -0.5, -0.5,
        //    0.5, 0.5, -0.5,
        //    -0.5, 0.5, -0.5,
//
        //    // Plust Z - vertices
        //    -0.5, -0.5, 0.5,
        //    0.5, -0.5, 0.5,
        //    0.5, 0.5, 0.5,
        //    -0.5, 0.5, 0.5,
        //]);
        

        const vertices = new Float32Array(
        [
            // Minus Z - vertices
            boxClipping.xMinusSideFace,boxClipping.yMinusBottomFace,boxClipping.zMinusBackFace,
            boxClipping.xPlusSideFace,boxClipping.yMinusBottomFace,boxClipping.zMinusBackFace,
            boxClipping.xPlusSideFace,boxClipping.yPlusTopFace,boxClipping.zMinusBackFace,
            boxClipping.xMinusSideFace,boxClipping.yPlusTopFace,boxClipping.zMinusBackFace,
            
            // Plust Z - vertices
            boxClipping.xMinusSideFace,boxClipping.yMinusBottomFace,boxClipping.zPlusFrontFace,
            boxClipping.xPlusSideFace,boxClipping.yMinusBottomFace,boxClipping.zPlusFrontFace,
            boxClipping.xPlusSideFace,boxClipping.yPlusTopFace,boxClipping.zPlusFrontFace,
            boxClipping.xMinusSideFace,boxClipping.yPlusTopFace,boxClipping.zPlusFrontFace,            
        ]);

        const positionAttribute = geometry_.getAttribute('position') as THREE.BufferAttribute;

        positionAttribute.array.set(vertices);
        positionAttribute.needsUpdate= true;

        geometry_.computeBoundingSphere();
    }

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
            u_isoValue: { value: IsoValue},
        }),
        [dims.x, dims.y, dims.z,IsoValue],
    );

    const boundingBoxGeometry = useMemo(()=>
    {
        const vertices = new Float32Array(
        [
            // Minus Z - vertices
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            -0.5, 0.5, -0.5,

            // Plust Z - vertices
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5,
        ]);

        const vertices_new = new Float32Array(
        [
            // Minus Z - vertices
            1, -1, -1,
            1, 1, -1,
            -1, 1, -1,

            // Plust Z - vertices
            -1, -1, 1,
            1, -1, 1,
            1, 1, 1,
            -1, 1, 1,
        ]);

        const cubeIndices = new Uint16Array([
            0, 5, 4, 5, 0, 1, 3, 7, 6, 3, 6, 2, 7, 4, 6, 6, 4, 5, 2, 1, 3, 3, 1, 0, 3, 0, 7, 7, 0,
            4, 6, 5, 2, 2, 5, 1,
        ]);

        const geometry = new THREE.BufferGeometry();
        // const positionVertexArray=new Float32Array(8*3);


        const vao_BoundingBox = new THREE.BufferAttribute(
            vertices,3
        );

        vao_BoundingBox.setUsage(THREE.DynamicDrawUsage);

        geometry.setAttribute('position',vao_BoundingBox);
        geometry.setIndex(new THREE.BufferAttribute(cubeIndices,1));
        geometry.setDrawRange(0,36);

        return (geometry);
    },[]);

    // Bind the texture to the shader, and free its GPU memory when it changes or on unmount.
    useEffect(() => {

        UpdateVertexBuffer(boundingBoxGeometry);
        uniforms.uVolumeTexture.value = texture;
        return () => texture.dispose();
    }, [texture, uniforms,boxClipping]);

    // Every frame, put the camera in the cube's local space so the shader can get ray directions.
    useFrame(({ camera }) => {
        // UpdateVertexBuffer();
        meshRef.current?.worldToLocal(camera.getWorldPosition(uniforms.u_cameraPosition.value));
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
            />
        </mesh>
    );
};

export default PseudoIsoSurfaceFx;