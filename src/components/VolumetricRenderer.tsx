import { useEffect, useMemo, useState } from 'react';

import * as THREE from 'three';

import { Html } from '@react-three/drei';

import { useTheme } from '../context/ThemeContext';
import { RenderFx, VolumeSettings } from '../types';
import { createWireframeEdgePositions } from '../utils/clippingBox';
import { VOXEL_COUNT } from '../utils/constants';
import MarchingTetrahedraFx from './volume/MarchingTetrahedraFx';
import RaycastingFx from './volume/RaycastingFx';
import { useWireframe } from './volume/useWireframe';

export interface VolumetricRendererProps {
    /** One byte per voxel, 256^3 total. `null` while loading. */
    volumeData: Uint8Array | null;
    volumeSettings: VolumeSettings;
}

/** The Render FX list. Add an entry here and it shows up in the UI. */
const DEFAULT_ISO_VALUE = 100; // move such things to CONSTANTS

const RENDER_FX: RenderFx[] = [
    { name: 'Raycasting', Effect: RaycastingFx },
    {
        name: 'Marching Tetrahedra',
        Effect: MarchingTetrahedraFx,
        hasWireframe: true,
        hasIsoValue: true,
    },
];

/** Bold when on, dimmed when off. */
const buttonClass = (active: boolean) =>
    `px-2 py-0 bg-transparent ${active ? 'font-bold' : 'opacity-60'}`;

/** Draws a raw 256^3 volume with the picked Render FX. Use inside an R3F `<Canvas>`. */
const VolumetricRenderer = ({ volumeData, volumeSettings }: VolumetricRendererProps) => {
    const { theme } = useTheme();
    const [activeFx, setActiveFx] = useState(0);
    const [isoValue, setIsoValue] = useState(DEFAULT_ISO_VALUE);

    const { Effect, hasWireframe = false, hasIsoValue = false } = RENDER_FX[activeFx];
    const [wireframe, setWireframe] = useWireframe(hasWireframe);

    const voxels = useMemo(() => {
        if (!volumeData) return null;

        // fixed 256^3 buffer: extra bytes are cut off, missing bytes stay zero
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
            <Html position={[0, 0.75, 0]} center>
                <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md backdrop-blur-md whitespace-nowrap select-none ${
                        theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                    }`}
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
                    {hasIsoValue && (
                        <>
                            <span className="opacity-30">|</span>
                            <label className="flex items-center gap-1.5 px-2 text-sm">
                                <span>ISO: {isoValue}</span>
                                <input
                                    type="range"
                                    min={1}
                                    max={254}
                                    step={1}
                                    value={isoValue}
                                    onChange={(e) => setIsoValue(Number(e.target.value))}
                                    className="w-24 cursor-pointer accent-current"
                                />
                            </label>
                        </>
                    )}
                </div>
            </Html>
        </>
    );
};

export default VolumetricRenderer;
