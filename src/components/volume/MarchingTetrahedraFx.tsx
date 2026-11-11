import { useEffect, useMemo } from 'react';

import * as THREE from 'three';

import marchingTetrahedraFragment from '../../shaders/volume/marchingTetrahedraFragment.glsl';
import marchingTetrahedraVertex from '../../shaders/volume/marchingTetrahedraVertex.glsl';
import { RenderFxProps } from '../../types';
import { FLOATS_PER_VERTEX } from '../../utils/constants';
import { marchTetrahedra } from '../../utils/marchTetrahedra';

/** Draws the volume's iso-surface as a marching tetrahedra mesh. */
const MarchingTetrahedraFx = ({ voxels }: RenderFxProps) => {
    const surface = useMemo(() => {
        const vertices = new THREE.InterleavedBuffer(marchTetrahedra(voxels), FLOATS_PER_VERTEX);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(vertices, 3, 0));
        geometry.setAttribute('normal', new THREE.InterleavedBufferAttribute(vertices, 3, 3));

        return geometry;
    }, [voxels]);

    // Free the mesh from the GPU when the effect is switched off or the data changes.
    useEffect(() => () => surface.dispose(), [surface]);

    return (
        <mesh geometry={surface}>
            {/* triangle winding isn't consistent, so draw both faces */}
            <shaderMaterial
                vertexShader={marchingTetrahedraVertex}
                fragmentShader={marchingTetrahedraFragment}
                glslVersion={THREE.GLSL3}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

export default MarchingTetrahedraFx;
