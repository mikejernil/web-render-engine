import { useMemo, useState } from 'react';

import { Html } from '@react-three/drei';

import { useTheme } from '../context/ThemeContext';
import { RenderFx } from '../types';
import { VOXEL_COUNT } from '../utils/constants';
import MarchingTetrahedraFx from './volume/MarchingTetrahedraFx';
import RaycastingFx from './volume/RaycastingFx';

export interface VolumetricRendererProps {
    /** One byte per voxel, 256^3 total. `null` while loading. */
    volumeData: Uint8Array | null;
}

/** The Render FX list. Add an entry here and it shows up in the UI. */
const RENDER_FX: RenderFx[] = [
    { name: 'Raycasting', Effect: RaycastingFx },
    { name: 'Marching Tetrahedra', Effect: MarchingTetrahedraFx },
];

/**
 * Draws a raw 256^3 volume inside a unit cube with the effect picked from the Render FX list.
 * Use inside an R3F `<Canvas>`.
 */
const VolumetricRenderer = ({ volumeData }: VolumetricRendererProps) => {
    const { theme } = useTheme();
    const [activeFx, setActiveFx] = useState(0);
    const { Effect } = RENDER_FX[activeFx];

    const voxels = useMemo(() => {
        if (!volumeData) return null;

        // fixed 256^3 buffer: extra bytes are cut off, missing bytes stay zero
        const data = new Uint8Array(VOXEL_COUNT);
        data.set(volumeData.subarray(0, VOXEL_COUNT));

        return data;
    }, [volumeData]);

    return (
        <>
            {voxels && <Effect voxels={voxels} />}
            <Html position={[0, 0.75, 0]} center>
                <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md backdrop-blur-md whitespace-nowrap select-none ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                >
                    <span>Render FX -</span>
                    {RENDER_FX.map(({ name }, index) => (
                        <button
                            key={name}
                            className={`px-2 py-0 bg-transparent ${index === activeFx ? 'font-bold' : 'opacity-60'}`}
                            onClick={() => setActiveFx(index)}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </Html>
        </>
    );
};

export default VolumetricRenderer;
