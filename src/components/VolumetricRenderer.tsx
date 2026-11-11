import { useMemo, useState } from 'react';

import { Html } from '@react-three/drei';

import { useTheme } from '../context/ThemeContext';
import { RenderFx } from '../types';
import { VOXEL_COUNT } from '../utils/constants';
import MarchingTetrahedraFx from './volume/MarchingTetrahedraFx';
import RaycastingFx from './volume/RaycastingFx';
import { useWireframe } from './volume/useWireframe';

export interface VolumetricRendererProps {
    /** One byte per voxel, 256^3 total. `null` while loading. */
    volumeData: Uint8Array | null;
}

/** The Render FX list. Add an entry here and it shows up in the UI. */
const RENDER_FX: RenderFx[] = [
    { name: 'Raycasting', Effect: RaycastingFx },
    { name: 'Marching Tetrahedra', Effect: MarchingTetrahedraFx, hasWireframe: true },
];

/** Bold when on, dimmed when off. */
const buttonClass = (active: boolean) =>
    `px-2 py-0 bg-transparent ${active ? 'font-bold' : 'opacity-60'}`;

/** Draws a raw 256^3 volume with the picked Render FX. Use inside an R3F `<Canvas>`. */
const VolumetricRenderer = ({ volumeData }: VolumetricRendererProps) => {
    const { theme } = useTheme();
    const [activeFx, setActiveFx] = useState(0);
    const { Effect, hasWireframe = false } = RENDER_FX[activeFx];
    const [wireframe, setWireframe] = useWireframe(hasWireframe);

    const voxels = useMemo(() => {
        if (!volumeData) return null;

        // fixed 256^3 buffer: extra bytes are cut off, missing bytes stay zero
        const data = new Uint8Array(VOXEL_COUNT);
        data.set(volumeData.subarray(0, VOXEL_COUNT));

        return data;
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
