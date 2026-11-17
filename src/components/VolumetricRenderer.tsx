import { useEffect, useMemo, useState } from 'react';

import * as THREE from 'three';

import { Html } from '@react-three/drei';

import { useTheme } from '../context/ThemeContext';
import { DataFormat, RenderFx, VolumeSettings } from '../types';
import { createWireframeEdgePositions } from '../utils/clippingBox';
import { detectFormat, getMaxValueForFormat } from '../utils/volumeData';
import MarchingTetrahedraFx from './volume/MarchingTetrahedraFx';
import RaycastingFx from './volume/RaycastingFx';
import { useWireframe } from './volume/useWireframe';

export interface VolumetricRendererProps {
    volumeData: Uint8Array | Uint16Array | Uint32Array | Float32Array | null;
    volumeSettings: VolumeSettings;
    volumeDimensions?: { x: number; y: number; z: number };
}

/** The Render FX list. Add an entry here and it shows up in the UI. */
const RENDER_FX: RenderFx[] = [
    { name: 'Raycasting', Effect: RaycastingFx },
    {
        name: 'Marching Tetrahedra',
        Effect: MarchingTetrahedraFx,
        hasWireframe: true,
    },
];

/** Bold when on, dimmed when off. */
const buttonClass = (active: boolean) =>
    `px-2 py-0 bg-transparent ${active ? 'font-bold' : 'opacity-60'}`;

/** Draws a raw 256^3 volume with the picked Render FX. Supports uint8, uint16, uint32, float32 data types. */
const VolumetricRenderer = ({
    volumeData,
    volumeSettings,
    volumeDimensions,
}: VolumetricRendererProps) => {
    const { theme } = useTheme();
    const [activeFx, setActiveFx] = useState(0);
    const { Effect, hasWireframe = false } = RENDER_FX[activeFx];
    const [wireframe, setWireframe] = useWireframe(hasWireframe);

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

        // Normalize all data types to [0, 1] range as Uint8Array for render effects
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
                    volumeSettings={volumeSettings}
                    volumeDimensions={dims}
                />
            )}
            {volumeSettings.showClippingBox && (
                <lineSegments geometry={clippingGeometry} scale={0.5}>
                    <lineBasicMaterial color="#00e5ff" />
                </lineSegments>
            )}
            <Html position={[0, 0.75, 0]} center>
                <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md backdrop-blur-md whitespace-nowrap select-none ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                >
                    <span>Render FX -</span>
                    {RENDER_FX.map(({ name }, index) => (
                        <button
                            key={name}
                            className={buttonClass(index === activeFx)}
                            onClick={() => setActiveFx(index)}
                        >
                            {name}
                        </button>
                    ))}
                    {hasWireframe && (
                        <>
                            <span className="opacity-30">|</span>
                            <button
                                className={buttonClass(wireframe)}
                                aria-pressed={wireframe}
                                onClick={() => setWireframe(!wireframe)}
                            >
                                Wireframe (W)
                            </button>
                        </>
                    )}
                </div>
            </Html>
        </>
    );
};

export default VolumetricRenderer;
