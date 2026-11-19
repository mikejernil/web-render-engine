import { useEffect, useMemo } from 'react';

import * as THREE from 'three';

import { DataFormat, RenderFx, VolumeDimensions, VolumeSettings } from '../types';
import { createWireframeEdgePositions } from '../utils/clippingBox';
import { detectFormat, getMaxValueForFormat } from '../utils/volumeData';
import MarchingTetrahedraFx from './volume/MarchingTetrahedraFx';
import RaycastingFx from './volume/RaycastingFx';

export interface VolumetricRendererProps {
    /** Volume voxel buffer. `null` while loading. */
    volumeData: Uint8Array | Uint16Array | Uint32Array | Float32Array | null;
    volumeSettings: VolumeSettings;
    volumeDimensions?: VolumeDimensions;
}

/** Default iso-surface threshold value. */
export const DEFAULT_ISO_VALUE = 100; // move such things to CONSTANTS

/** The Render FX list. Add an entry here and it shows up in the UI. */
export const RENDER_FX: RenderFx[] = [
    { name: 'Raycasting', Effect: RaycastingFx },
    {
        name: 'Marching Tetrahedra',
        Effect: MarchingTetrahedraFx,
        hasWireframe: true,
        hasIsoValue: true,
    },
];

/**
 * Renders the active volume effect and clipping box wireframe.
 * Supports uint8, uint16, uint32, and float32 data types.
 */
const VolumetricRenderer = ({
    volumeData,
    volumeSettings,
    volumeDimensions,
}: VolumetricRendererProps) => {
    const activeFx = volumeSettings.activeFx ?? 0;
    const wireframe = volumeSettings.wireframe ?? false;
    const isoValue = volumeSettings.isoValue ?? DEFAULT_ISO_VALUE;

    const { Effect } = RENDER_FX[activeFx] || RENDER_FX[0];

    // Use provided dimensions or default to 256^3
    const dims = volumeDimensions || { x: 256, y: 256, z: 256 };
    const voxelCount = dims.x * dims.y * dims.z;

    // Detect format once, memoized separately
    const dataFormat = useMemo(() => {
        if (!volumeData) return 'uint8' as DataFormat;
        return detectFormat(volumeData);
    }, [volumeData]);

    const maxValue = useMemo(() => {
        return getMaxValueForFormat(dataFormat);
    }, [dataFormat]);

    const voxels = useMemo(() => {
        if (!volumeData) return null;

        // Normalize all data types to [0, 255] range as Uint8Array for render effects
        const normalized = new Uint8Array(voxelCount);
        for (let i = 0; i < volumeData.length && i < voxelCount; i++) {
            normalized[i] = Math.round((volumeData[i] / maxValue) * 255);
        }

        return normalized;
    }, [volumeData, voxelCount, maxValue]);

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
                    volumeDimensions={dims}
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