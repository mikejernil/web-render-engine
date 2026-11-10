import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

// import fragmentShader from '../shaders/volume/fragment.glsl';
// import vertexShader from '../shaders/volume/vertex.glsl';

import fragmentShader_basic from '../shaders/3dtextureslicing/fragment.glsl';
import vertexShader_basic from '../shaders/3dtextureslicing/vertex.glsl';

import fragmentShader_colormap from '../shaders/colormap/fragment.glsl';
import vertexShader_colormap from '../shaders/colormap/vertex.glsl';


let effectType =0;

/** Voxels per side of the volume. */
const DIMENSION = 256;
const VOXEL_COUNT = DIMENSION * DIMENSION * DIMENSION;

const EPSILON = 0.0001;
const MAX_SLICES = 512;
const MAX_SLICE_VERTICES = MAX_SLICES *12;
let num_slices = DIMENSION;
const edges= [
    [0,1],
    [1,2],
    [2,3],
    [3,0],
    [0,4],
    [1,5],
    [2,6],
    [3,7],
    [4,5],
    [5,6],
    [6,7],
    [7,4],
];

const edgeList= [
	[0,1,5,6,   4,8,11,9,  3,7,2,10 ],      // v0 is front
	[0,4,3,11,  1,2,6,7,   5,9,8,10 ],      // v1 
	[1,5,0,8,   2,3,7,4,   6,10,9,11],      // v2 
	[7,11,10,8, 2,6,1,9,   3,0,4,5  ],      // v3 

    [8, 5, 9, 1, 11, 10, 7, 6, 4, 3, 0, 2], // v4 
    [9, 6, 10, 2, 8, 11, 4, 7, 5, 0, 1, 3], // v5 
    [9, 8, 5, 4, 6, 1, 2, 0, 10, 7, 11, 3], // v6 
    [10, 9, 6, 5, 7, 2, 3, 1, 11, 4, 8, 0], // v7 
];

const vTextureSlices = new Array(512 *12);

for(let i =0;i<vTextureSlices.length;i++)
{
    vTextureSlices[i]=new THREE.Vector3();
}

const vertices = [
    new THREE.Vector3(-0.5, -0.5, -0.5), // v0
    new THREE.Vector3( 0.5, -0.5, -0.5), // v1
    new THREE.Vector3( 0.5,  0.5, -0.5), // v2
    new THREE.Vector3(-0.5,  0.5, -0.5), // v3

    new THREE.Vector3(-0.5, -0.5,  0.5), // v4
    new THREE.Vector3( 0.5, -0.5,  0.5), // v5
    new THREE.Vector3( 0.5,  0.5,  0.5), // v6
    new THREE.Vector3(-0.5,  0.5,  0.5)  // v7
];
const viewDirection = new THREE.Vector3(1.0,1.0,1.0);

const jet_values = [
    new THREE.Vector4(0.0, 0.0, 0.5, 0),
    new THREE.Vector4(0.0, 0.0, 1.0, 0.1),  // Blue
    new THREE.Vector4(0.0, 0.5, 1.0, 0.3),

    new THREE.Vector4(0.0, 1.0, 1.0, 0.5),
    new THREE.Vector4(0.5, 1.0, 0.5, 0.75),
    new THREE.Vector4(1.0, 1.0, 0.0, 0.8),

    new THREE.Vector4(1.0, 0.5, 0.0, 0.6),
    new THREE.Vector4(1.0, 0.0, 0.0, 0.5),   // Red
    new THREE.Vector4(0.5, 0.0, 0.0, 0.0),
];

let texture_TransferFunction = null;

/**
 * SliceVolume() Function Definition:
 */
function SliceVolume(geometry_:THREE.BufferGeometry)
{
    // local:
    let maxDistance = viewDirection.dot(vertices[0]);
    let minDistance = maxDistance;
    let maxIndex =0;

    // code:
    for(let i =1;i<8;i++)
    {
        const fDistance = viewDirection.dot(vertices[i]);

        if(fDistance > maxDistance)
        {
            maxDistance = fDistance;
            maxIndex = i;
        }

        if(fDistance <minDistance)
            minDistance = fDistance;

    }

    minDistance-=EPSILON;
    maxDistance+=EPSILON;

    // edge intersection calculations:
    const vecStart:THREE.Vector3[]=[];
    const vecDir:THREE.Vector3[]=[];

    const lambda = new Float32Array(12);
    const lambda_inc = new Float32Array(12);
    let denom = 0;

    // calc slicing plane distances:
    let plane_dist = minDistance;

    const plane_dist_inc = (maxDistance-minDistance)/num_slices;

    // calc start and direction vectors for all 12 edges:

    for(let i=0;i<12;i++)
    {
        const edgeIndex = edgeList[maxIndex][i];
        const startIndex = edges[edgeIndex][0];
        const endIndex = edges[edgeIndex][1];

        vecStart[i] = vertices[startIndex].clone();

        vecDir[i] = vertices[endIndex].clone().sub(vecStart[i]);

        denom = vecDir[i].dot(viewDirection);

        if(1.0 +denom !== 1.0)
        {
            lambda_inc[i] = plane_dist_inc/denom;
            lambda[i]=(plane_dist - vecStart[i].dot(viewDirection))/denom;
        }
        else
        {
            lambda[i] = -1.0;
            lambda_inc[i]=0.0;
        }
    }

    // calc intersection points:
    const intersection=[];
    for(let i=0;i<6;i++)
    {
        intersection[i] = new THREE.Vector3();
    }

    const dL = new Float32Array(12);

    const indeices =[
        0,1,2,
        0,2,3,
        0,3,4,
        0,4,5
    ];

    let count = 0;

    // Helper to calculate an edge intersection.
    function getIntersection(edgeIndex:number):THREE.Vector3
    {
        return vecStart[edgeIndex].clone().addScaledVector(
            vecDir[edgeIndex],
            dL[edgeIndex]
            );
    }

    // looping through slicing planes:

    // for(let i = num_slices-1;i>=0;i--)
    for(let i = 0;i<num_slices;i++)
    {
        for(let e=0;e<12;e++)
        {
            dL[e]= lambda[e]+i*lambda_inc[e];
        }

        // first intersection:
        if(dL[0] >= 0.0 && dL[0] <1.0)
        {
            intersection[0].copy(getIntersection(0));
        }
        else if(dL[1] >= 0.0 && dL[1]<1.0)
        {
            intersection[0].copy(getIntersection(1));
        }
        else if(dL[3] >= 0.0 && dL[3]<1.0)
        {
            intersection[0].copy(getIntersection(3));
        }
        else
        {
            continue;
        }

        // second intersection:
        if(dL[2] >= 0.0 && dL[2] <1.0)
        {
            intersection[1].copy(getIntersection(2));
        }
        else if(dL[0] >= 0.0 && dL[0]<1.0)
        {
            intersection[1].copy(getIntersection(0));
        }
        else if(dL[1] >= 0.0 && dL[1]<1.0)
        {
            intersection[1].copy(getIntersection(1));
        }
        else
        {
            intersection[1].copy(getIntersection(3));
        }

        // third intersection:
        if(dL[4] >= 0.0 && dL[4] <1.0)
        {
            intersection[2].copy(getIntersection(4));
        }
        else if(dL[5] >= 0.0 && dL[5] <1.0)
        {
            intersection[2].copy(getIntersection(5));
        }
        else
        {
            intersection[2].copy(getIntersection(7));
        }

        // 4th intersection:
        if(dL[6] >= 0.0 && dL[6] <1.0)
        {
            intersection[3].copy(getIntersection(6));
        }
        else if(dL[4] >= 0.0 && dL[4] <1.0)
        {
            intersection[3].copy(getIntersection(4));
        }
        else if(dL[5] >= 0.0 && dL[5] <1.0)
        {
            intersection[3].copy(getIntersection(5));
        }
        else
        {
            intersection[3].copy(getIntersection(7));
        }

        // 5th intersection:
        if(dL[8] >= 0.0 && dL[8] <1.0)
        {
            intersection[4].copy(getIntersection(8));
        }
        else if(dL[9] >= 0.0 && dL[9] <1.0)
        {
            intersection[4].copy(getIntersection(9));
        }
        else
        {
            intersection[4].copy(getIntersection(11));
        }

        // 6th intersection:
        if(dL[10] >= 0.0 && dL[10] <1.0)
        {
            intersection[5].copy(getIntersection(10));
        }
        else if(dL[8] >= 0.0 && dL[8] <1.0)
        {
            intersection[5].copy(getIntersection(8));
        }
        else if(dL[9] >= 0.0 && dL[9] <1.0)
        {
            intersection[5].copy(getIntersection(9));
        }
        else
        {
            intersection[5].copy(getIntersection(11));
        }

        // triangle fan vertices:

        for(let j=0;j<12;j++)
        {
            vTextureSlices[count].copy(intersection[indeices[j]]);
            count++;
        }

    }

    // Update VAO geometry:
    const positionAttribute = geometry_.getAttribute('position');
    for(let i=0;i<count;i++)
    {
        const v = vTextureSlices[i];
        positionAttribute.setXYZ(i,v.x,v.y,v.z);
    }

    positionAttribute.needsUpdate=true;

    geometry_.setDrawRange(0,count);
    geometry_.computeBoundingSphere();
    

}


export interface VolumetricRendererProps {
    /** One byte per voxel, 256^3 total. `null` while loading. */
    volumeData: Uint8Array | null;
}

/** Ray marches a raw 256^3 volume inside a unit cube. Use inside an R3F `<Canvas>`. */
const VolumetricRenderer = ({ volumeData }: VolumetricRendererProps) => {
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

    const colormapTexture = useMemo(() =>
    {
        if (!volumeData) return null;

        if (effectType!=1) return null;

        let rows = 256;
        let cols = 4;
        let pDataArray = new Float32Array(rows * cols);
        let indices = new Array(9);

        for (let i = 0; i < 9; i++)
        {
            let index = i * 28;
            let offset = index *4;

            pDataArray[offset+0] = jet_values[i].x;
            pDataArray[offset+1] = jet_values[i].y;
            pDataArray[offset+2] = jet_values[i].z;
            pDataArray[offset+3] = jet_values[i].w;

            indices[i] = index;
        }

        for (let j = 0; j < 9 - 1; j++)
        {
            let start = indices[j];
            let end = indices[j+1];
            let dIndex = end-start;

            let dDataR = (pDataArray[end * 4+ 0] - pDataArray[start*4 +0]);
            let dDataG = (pDataArray[end * 4+ 1] - pDataArray[start*4 +1]);
            let dDataB = (pDataArray[end * 4+ 2] - pDataArray[start*4 +2]);
            let dDataA = (pDataArray[end * 4+ 3] - pDataArray[start*4 +3]);


            let dDataIncR = dDataR / (dIndex);
            let dDataIncG = dDataG / (dIndex);
            let dDataIncB = dDataB / (dIndex);
            let dDataIncA = dDataA / (dIndex);

            for (let i = start + 1; i < end; i++)
            {
                let offset = i*4;
                let previous = (i-1)*4;
                
                pDataArray[offset+0] = (pDataArray[previous+0] + dDataIncR);
                pDataArray[offset+1] = (pDataArray[previous+1] + dDataIncG);
                pDataArray[offset+2] = (pDataArray[previous+2] + dDataIncB);
                pDataArray[offset+3] = (pDataArray[previous+3] + dDataIncA);
            }
        }

        const result = new THREE.DataTexture(pDataArray, DIMENSION, 1,THREE.RGBAFormat,THREE.FloatType);
        result.minFilter = THREE.LinearFilter;
        result.magFilter = THREE.LinearFilter;
        result.wrapS = THREE.ClampToEdgeWrapping;
        result.wrapT = THREE.ClampToEdgeWrapping;
        result.needsUpdate = true;

        return result;
    }, [volumeData]);

    const uniforms = useMemo(
        () => ({
            uVolumeTexture: { value: null as THREE.Data3DTexture | null },
            u_LevelOfDetail:{ value: null as THREE.DataTexture | null },
            u_cameraPosition: { value: new THREE.Vector3() },
            u_stepSize: {
                value: new THREE.Vector3(1 / DIMENSION, 1 / DIMENSION, 1 / DIMENSION),
            },
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

    // Bind the current texture to the shader uniform, and free its GPU memory
    // when the data changes or the component unmounts.
    useEffect(() => {
        uniforms.uVolumeTexture.value = texture;
        if(effectType==1)
            uniforms.u_LevelOfDetail.value=colormapTexture;
        else
            uniforms.u_LevelOfDetail.value=null;

        SliceVolume(boundingBoxGeometry);

        return () => texture?.dispose();
    }, [texture, uniforms,boundingBoxGeometry]
    );

    // Every frame, give the shader the camera position in the cube's local space
    // so it can work out the ray direction for each pixel.
    useFrame(({ camera }) => {
        const mesh = meshRef.current;
        const material = materialRef.current;
        if (!mesh || !material) return;

        camera.getWorldPosition(cameraPosition);
        mesh.worldToLocal(cameraPosition);
        material.uniforms.u_cameraPosition.value.copy(cameraPosition);

        mesh.updateMatrixWorld();
        camera.updateMatrix();
        viewDirection.copy(cameraPosition).normalize();
        SliceVolume(boundingBoxGeometry);

    });

    return (
        <mesh ref={meshRef}
        geometry= {boundingBoxGeometry} 
        >
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={effectType==1?vertexShader_colormap:vertexShader_basic}
                fragmentShader={effectType==1?fragmentShader_colormap:fragmentShader_basic}
                glslVersion={THREE.GLSL3}
                transparent
                side={THREE.FrontSide}
            />
        </mesh>
    );
};

export default VolumetricRenderer;
