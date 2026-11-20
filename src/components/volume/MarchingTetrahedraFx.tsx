import { useEffect, useMemo } from 'react';

import * as THREE from 'three';

import marchingTetrahedraFragment from '../../shaders/volume/marchingTetrahedraFragment.glsl';
import marchingTetrahedraVertex from '../../shaders/volume/marchingTetrahedraVertex.glsl';
import { RenderFxProps } from '../../types';
import { marchTetrahedra } from '../../utils/marchTetrahedra';

/** Draws the volume's iso-surface as a marching tetrahedra mesh. */
const MarchingTetrahedraFx = ({ voxels, wireframe = false, isoValue = 100 }: RenderFxProps) => {
    const surface = useMemo(() => {
        const { positions, normals } = marchTetrahedra(voxels, isoValue);
        return new THREE.BufferGeometry()
            .setAttribute('position', new THREE.BufferAttribute(positions, 3))
            .setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    }, [voxels, isoValue]);

    // Cleanup geometry on unmount or update
    useEffect(() => () => surface.dispose(), [surface]);

    return (
        <mesh geometry={surface}>
            {/* triangle winding isn't consistent, so draw both faces */}
            <shaderMaterial
                vertexShader={marchingTetrahedraVertex}
                fragmentShader={marchingTetrahedraFragment}
                glslVersion={THREE.GLSL3}
                side={THREE.DoubleSide}
                wireframe={wireframe}
            />
        </mesh>
    );
};

export default MarchingTetrahedraFx;
