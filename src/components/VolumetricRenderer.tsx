import { useEffect, useMemo } from 'react';

import * as THREE from 'three';

import { RenderFx, VolumeSettings } from '../types';
import { createWireframeEdgePositions } from '../utils/clippingBox';
import { VOXEL_COUNT } from '../utils/constants';
import MarchingTetrahedraFx from './volume/MarchingTetrahedraFx';
import RaycastingFx from './volume/RaycastingFx';

export interface VolumetricRendererProps {
    volumeData: Uint8Array | null;
    volumeSettings: VolumeSettings;
}
/** The Render FX list. Add an entry here and it shows up in the UI. */
export const DEFAULT_ISO_VALUE = 100; // move such things to CONSTANTS

export const RENDER_FX: RenderFx[] = [
    { name: 'Raycasting', Effect: RaycastingFx },
    {
        name: 'Marching Tetrahedra',
        Effect: MarchingTetrahedraFx,
        hasWireframe: true,
        hasIsoValue: true,
    },
];

/** Renders the active volume effect and clipping box wireframe. */
const VolumetricRenderer = ({ volumeData, volumeSettings }: VolumetricRendererProps) => {
    const activeFx = volumeSettings.activeFx ?? 0;
    const wireframe = volumeSettings.wireframe ?? false;
    const isoValue = volumeSettings.isoValue ?? DEFAULT_ISO_VALUE;

    const { Effect } = RENDER_FX[activeFx] || RENDER_FX[0];

    const voxels = useMemo(() => {
        if (!volumeData) return null;
        const data = new Uint8Array(VOXEL_COUNT);
        data.set(volumeData.subarray(0, VOXEL_COUNT));
        return data;
    }, [volumeData]);

    const clippingGeometry = useMemo(() => {
        const positions = createWireframeEdgePositions(volumeSettings.faces);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geometry;
    }, [volumeSettings.faces]);

    useEffect(() => {
        return () => clippingGeometry.dispose();
    }, [clippingGeometry]);

    return (
        <>
            {voxels && (
                <Effect
                    voxels={voxels}
                    wireframe={wireframe}
                    isoValue={isoValue}
                    volumeSettings={volumeSettings}
                />
            )}
            {volumeSettings.showClippingBox && (
                <lineSegments geometry={clippingGeometry} scale={0.5}>
                    <lineBasicMaterial color="#00e5ff" />
                </lineSegments>
            )}
        </>
    );
};

export default VolumetricRenderer;
