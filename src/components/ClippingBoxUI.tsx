import React, { useEffect, useState } from 'react';

import {
    ControlOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    ReloadOutlined,
} from '@ant-design/icons';

import { ClippingBoxFaces, VolumeSettings, isValidDataFormat } from '../types';
import { INITIAL_CLIPPING_BOX_FACES } from '../utils/clippingBox';
import { RENDER_FX } from './VolumetricRenderer';

export interface ClippingBoxUIProps {
    settings: VolumeSettings;
    setSettings: React.Dispatch<React.SetStateAction<VolumeSettings>>;
    theme: 'light' | 'dark';
}

const MIN_GAP = 0.05;
const TYPING_FIELDS = 'input, textarea, select, [contenteditable]';

const FACE_CONTROLS: Array<{
    key: keyof ClippingBoxFaces;
    label: string;
    isMin: boolean;
    pairedKey: keyof ClippingBoxFaces;
}> = [
    { key: 'xMinusSideFace', label: 'X- Left', isMin: true, pairedKey: 'xPlusSideFace' },
    { key: 'xPlusSideFace', label: 'X+ Right', isMin: false, pairedKey: 'xMinusSideFace' },
    { key: 'yMinusBottomFace', label: 'Y- Bottom', isMin: true, pairedKey: 'yPlusTopFace' },
    { key: 'yPlusTopFace', label: 'Y+ Top', isMin: false, pairedKey: 'yMinusBottomFace' },
    { key: 'zMinusBackFace', label: 'Z- Back', isMin: true, pairedKey: 'zPlusFrontFace' },
    { key: 'zPlusFrontFace', label: 'Z+ Front', isMin: false, pairedKey: 'zMinusBackFace' },
];

/** UI panel for volume rendering, dimensions, and clipping settings. */
const ClippingBoxUI: React.FC<ClippingBoxUIProps> = ({ settings, setSettings, theme }) => {
    const [open, setOpen] = useState(true);
    const hasWireframe = Boolean(RENDER_FX[settings.activeFx]?.hasWireframe);

    useEffect(() => {
        if (!hasWireframe) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== 'w' || event.repeat) return;
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.target instanceof Element && event.target.closest(TYPING_FIELDS)) return;

            setSettings((prev) => ({ ...prev, wireframe: !prev.wireframe }));
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [hasWireframe, setSettings]);

    const surfaceStyle =
        theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black';
    const buttonStyle =
        theme === 'dark'
            ? 'bg-white/15 hover:bg-white/25 text-white'
            : 'bg-black/15 hover:bg-black/25 text-black';
    const activeButtonStyle =
        theme === 'dark'
            ? 'bg-white/35 text-white font-semibold'
            : 'bg-black/35 text-black font-semibold';
    const inputStyle =
        theme === 'dark'
            ? 'bg-white/25 border-white/10 text-white'
            : 'bg-black/25 border-black/10 text-black';

    const handleSliderChange = (
        key: keyof ClippingBoxFaces,
        value: number,
        isMin: boolean,
        pairedKey: keyof ClippingBoxFaces,
    ) => {
        setSettings((prev) => {
            const pairedValue = prev.faces[pairedKey];
            const clamped = isMin
                ? Math.min(value, pairedValue - MIN_GAP)
                : Math.max(value, pairedValue + MIN_GAP);

            return {
                ...prev,
                faces: {
                    ...prev.faces,
                    [key]: Number(clamped.toFixed(2)),
                },
            };
        });
    };

    return (
        <div className="fixed top-14 right-2 z-10 flex flex-col items-end gap-2 max-h-[85vh]">
            <div
                className={`p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${surfaceStyle}`}
                onClick={() => setOpen(!open)}
            >
                <ControlOutlined />
                <span>{open ? 'Close Volume Settings' : 'Volume Settings'}</span>
            </div>

            {open && (
                <div
                    className={`w-64 p-3 rounded-md backdrop-blur-md text-xs space-y-3 select-none overflow-y-auto ${surfaceStyle}`}
                >
                    <div className="space-y-1.5">
                        <div className="opacity-75">Render FX</div>
                        <div className="flex gap-1.5">
                            {RENDER_FX.map(({ name }, index) => (
                                <div
                                    key={name}
                                    onClick={() =>
                                        setSettings((prev) => ({ ...prev, activeFx: index }))
                                    }
                                    className={`flex-1 p-1.5 text-center rounded-md cursor-pointer transition ${
                                        settings.activeFx === index
                                            ? activeButtonStyle
                                            : buttonStyle
                                    }`}
                                >
                                    {name}
                                </div>
                            ))}
                        </div>
                        {hasWireframe && (
                            <div
                                onClick={() =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        wireframe: !prev.wireframe,
                                    }))
                                }
                                className={`p-1.5 text-center rounded-md cursor-pointer transition ${
                                    settings.wireframe ? activeButtonStyle : buttonStyle
                                }`}
                            >
                                Wireframe (W)
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="opacity-75">Dimensions</div>
                        <div className="flex gap-1.5">
                            {(['x', 'y', 'z'] as const).map((axis) => (
                                <input
                                    key={axis}
                                    className={`px-2 py-1 w-full rounded-md border border-solid text-center ${inputStyle}`}
                                    type="number"
                                    placeholder={axis.toUpperCase()}
                                    value={settings.dimensions[axis]}
                                    onChange={(e) =>
                                        setSettings((prev) => ({
                                            ...prev,
                                            dimensions: {
                                                ...prev.dimensions,
                                                [axis]: parseInt(e.target.value) || 256,
                                            },
                                        }))
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="opacity-75">Data Type</div>
                        <select
                            className={`w-full px-2 py-1.5 rounded-md border border-solid ${inputStyle}`}
                            value={settings.dataFormat}
                            onChange={(e) => {
                                if (isValidDataFormat(e.target.value)) {
                                    const dataFormat = e.target.value;
                                    setSettings((prev) => ({ ...prev, dataFormat }));
                                }
                            }}
                        >
                            <option value="uint8">uint8</option>
                            <option value="uint16">uint16</option>
                            <option value="uint32">uint32</option>
                            <option value="float32">float32</option>
                        </select>
                    </div>

                    <div className="space-y-2 pt-1">
                        <div className="opacity-75">Clipping Box</div>
                        <div className="flex gap-1.5">
                            <div
                                onClick={() =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        showClippingBox: !prev.showClippingBox,
                                    }))
                                }
                                className={`flex-1 p-1.5 gap-1.5 flex items-center justify-center rounded-md cursor-pointer transition ${buttonStyle}`}
                            >
                                {settings.showClippingBox ? (
                                    <EyeOutlined />
                                ) : (
                                    <EyeInvisibleOutlined />
                                )}
                                <span>
                                    {settings.showClippingBox ? 'Box Visible' : 'Box Hidden'}
                                </span>
                            </div>
                            <div
                                onClick={() =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        faces: { ...INITIAL_CLIPPING_BOX_FACES },
                                    }))
                                }
                                className={`p-1.5 gap-1.5 flex items-center justify-center rounded-md cursor-pointer transition ${buttonStyle}`}
                            >
                                <ReloadOutlined />
                                <span>Reset</span>
                            </div>
                        </div>

                        {FACE_CONTROLS.map(({ key, label, isMin, pairedKey }) => (
                            <div key={key} className="space-y-0.5">
                                <div className="flex justify-between">
                                    <span>{label}</span>
                                    <span className="font-mono">
                                        {settings.faces[key].toFixed(2)}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={-1}
                                    max={1}
                                    step={0.01}
                                    value={settings.faces[key]}
                                    onChange={(e) =>
                                        handleSliderChange(
                                            key,
                                            parseFloat(e.target.value),
                                            isMin,
                                            pairedKey,
                                        )
                                    }
                                    className="w-full cursor-pointer accent-cyan-400"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClippingBoxUI;