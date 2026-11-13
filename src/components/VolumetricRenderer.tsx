import { useMemo, useState } from 'react';

import { Html } from '@react-three/drei';

import { useTheme } from '../context/ThemeContext';
import { DataFormat, RenderFx } from '../types';
import { VOXEL_COUNT } from '../utils/constants';
import MarchingTetrahedraFx from './volume/MarchingTetrahedraFx';
import RaycastingFx from './volume/RaycastingFx';
import { useWireframe } from './volume/useWireframe';

export interface VolumetricRendererProps {
    volumeData: Uint8Array | Uint16Array | Uint32Array | Float32Array | null;
    dimensions?: [number, number, number];
}

function getMaxValueForFormat(format: DataFormat): number {
    switch (format) {
        case 'uint8':
            return 255;
        case 'uint16':
            return 65535;
        case 'uint32':
            return 4294967295;
        case 'float32':
            return 1.0;
        default:
            return 255;
    }
}

function detectFormat(data: Uint8Array | Uint16Array | Uint32Array | Float32Array): DataFormat {
    if (data instanceof Uint8Array) return 'uint8';
    if (data instanceof Uint16Array) return 'uint16';
    if (data instanceof Uint32Array) return 'uint32';
    if (data instanceof Float32Array) return 'float32';
    return 'uint8';
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
const VolumetricRenderer = ({ volumeData }: VolumetricRendererProps) => {
    const { theme } = useTheme();
    const [activeFx, setActiveFx] = useState(0);
    const { Effect, hasWireframe = false } = RENDER_FX[activeFx];
    const [wireframe, setWireframe] = useWireframe(hasWireframe);

    const voxels = useMemo(() => {
        if (!volumeData) return null;

        const detectedFormat = detectFormat(volumeData);
        const maxValue = getMaxValueForFormat(detectedFormat);

        // Normalize all data types to [0, 1] range as Uint8Array for render effects
        const normalized = new Uint8Array(VOXEL_COUNT);
        for (let i = 0; i < volumeData.length && i < VOXEL_COUNT; i++) {
            normalized[i] = Math.round((volumeData[i] / maxValue) * 255);
        }

        return normalized;
    }, [volumeData]);

    return (
        <>
            {voxels && <Effect voxels={voxels} wireframe={wireframe} />}
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
