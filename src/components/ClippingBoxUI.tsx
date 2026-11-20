import React, { useEffect, useState } from 'react';

import { ControlOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

import {
    ClippingBoxFaces,
    ColorMapPreset,
    VolumeSettings,
    isValidDataFormat,
} from '../types';
import { INITIAL_CLIPPING_BOX_FACES } from '../utils/clippingBox';
import { DEFAULT_ISO_VALUE, RENDER_FX } from './VolumetricRenderer';

export interface ClippingBoxUIProps {
    settings: VolumeSettings;
    setSettings: React.Dispatch<React.SetStateAction<VolumeSettings>>;
    theme: 'light' | 'dark';
}

const MIN_FACE_GAP = 0.05;
const TYPING_FIELDS = 'input, textarea, select, [contenteditable]';

// Six clipping plane slider configs
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

// Volume transfer color presets
const COLOR_PRESETS: Array<{ label: string; value: ColorMapPreset }> = [
    { label: 'Anatomical', value: 'anatomical' },
    { label: 'Viridis', value: 'viridis' },
    { label: 'Thermal', value: 'thermal' },
    { label: 'Grayscale', value: 'grayscale' },
];

/** UI panel for volume settings, shaders, and clipping bounds. */
const ClippingBoxUI: React.FC<ClippingBoxUIProps> = ({ settings, setSettings, theme }) => {
    const [open, setOpen] = useState(true);

    const activeFx = settings.activeFx ?? 0;
    const wireframe = settings.wireframe ?? false;
    const isoValue = settings.isoValue ?? DEFAULT_ISO_VALUE;
    const { hasWireframe = false, hasIsoValue = false } = RENDER_FX[activeFx] || RENDER_FX[0];

    // Reset wireframe when switching to an effect without wireframe support
    useEffect(() => {
        if (!hasWireframe) {
            setSettings((prev) => ({ ...prev, wireframe: false }));
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== 'w' || event.repeat) return;
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.target instanceof Element && event.target.closest(TYPING_FIELDS)) return;

            setSettings((prev) => ({ ...prev, wireframe: !prev.wireframe }));
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [hasWireframe, setSettings]);

    const panelBg =
        theme === 'dark'
            ? 'bg-neutral-900/75 text-white border-white/10'
            : 'bg-black/15 text-black border-black/10';
    const cardBg = theme === 'dark' ? 'bg-white/10' : 'bg-black/10';
    const btnBg =
        theme === 'dark'
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-black/10 hover:bg-black/20 text-black';
    const activeBtnBg =
        theme === 'dark'
            ? 'bg-white/30 text-white font-bold'
            : 'bg-black/25 text-black font-bold';

    // Clamp opposing faces so min never crosses max
    const updateFace = (
        key: keyof ClippingBoxFaces,
        value: number,
        isMin: boolean,
        pairedKey: keyof ClippingBoxFaces,
    ) => {
        setSettings((prev) => {
            const pairedValue = prev.faces[pairedKey];
            const clamped = isMin
                ? Math.min(value, pairedValue - MIN_FACE_GAP)
                : Math.max(value, pairedValue + MIN_FACE_GAP);

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
        <div className="fixed top-14 right-2 z-10 flex flex-col items-end gap-2">
            <div
                className={`p-2.5 gap-2 flex items-center justify-center rounded-lg border backdrop-blur-md cursor-pointer select-none ${panelBg}`}
                onClick={() => setOpen(!open)}
            >
                <ControlOutlined />
                <span>{open ? 'Close Volume Settings' : 'Volume Settings'}</span>
            </div>

            {open && (
                <div
                    className={`w-72 max-h-[82vh] p-3.5 rounded-xl border backdrop-blur-xl text-xs space-y-3 select-none overflow-y-auto ${panelBg}`}
                >
                    {/* Render FX, fixed wireframe button, and ISO slider */}
                    <div className="space-y-2">
                        <span className="font-semibold text-sm">Render Mode</span>
                        <div className="grid grid-cols-2 gap-1.5">
                            {RENDER_FX.map(({ name }, index) => (
                                <div
                                    key={name}
                                    onClick={() =>
                                        setSettings((prev) => ({ ...prev, activeFx: index }))
                                    }
                                    className={`py-2 px-2 text-center rounded-lg cursor-pointer transition ${
                                        activeFx === index ? activeBtnBg : btnBg
                                    }`}
                                >
                                    {name}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                            <div
                                onClick={() =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        showClippingBox: !prev.showClippingBox,
                                    }))
                                }
                                className={`py-1.5 px-2 gap-1.5 flex items-center justify-center rounded-lg cursor-pointer transition ${
                                    settings.showClippingBox ? activeBtnBg : btnBg
                                }`}
                            >
                                {settings.showClippingBox ? (
                                    <EyeOutlined />
                                ) : (
                                    <EyeInvisibleOutlined />
                                )}
                                <span>Clip Box</span>
                            </div>

                            <div
                                onClick={() => {
                                    if (!hasWireframe) return;
                                    setSettings((prev) => ({
                                        ...prev,
                                        wireframe: !prev.wireframe,
                                    }));
                                }}
                                className={`py-1.5 px-2 text-center rounded-lg transition ${
                                    !hasWireframe
                                        ? `${cardBg} opacity-35 cursor-not-allowed`
                                        : wireframe
                                          ? `${activeBtnBg} cursor-pointer`
                                          : `${btnBg} cursor-pointer`
                                }`}
                            >
                                Wireframe (W)
                            </div>
                        </div>

                        <div
                            className={`px-3 py-2 rounded-lg space-y-1.5 transition ${cardBg} ${
                                !hasIsoValue ? 'opacity-35 pointer-events-none' : ''
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-medium">ISO Value</span>
                                <span className="font-mono">{isoValue}</span>
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={254}
                                step={1}
                                disabled={!hasIsoValue}
                                value={isoValue}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        isoValue: Number(e.target.value),
                                    }))
                                }
                                className="volume-slider"
                            />
                        </div>
                    </div>

                    <div className="h-[1px] bg-current opacity-15" />

                    {/* Clipping plane sliders */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">Clip Faces</span>
                            <div
                                onClick={() =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        faces: { ...INITIAL_CLIPPING_BOX_FACES },
                                    }))
                                }
                                className={`px-3 py-1 rounded-lg cursor-pointer transition ${btnBg}`}
                            >
                                Reset
                            </div>
                        </div>

                        {FACE_CONTROLS.map(({ key, label, isMin, pairedKey }) => (
                            <div key={key} className={`px-3 py-2 rounded-lg space-y-1.5 ${cardBg}`}>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{label}</span>
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
                                        updateFace(
                                            key,
                                            parseFloat(e.target.value),
                                            isMin,
                                            pairedKey,
                                        )
                                    }
                                    className="volume-slider"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="h-[1px] bg-current opacity-15" />

                    {/* Density, opacity, and transfer color presets */}
                    <div className="space-y-2">
                        <div className={`px-3 py-2 rounded-lg space-y-1.5 ${cardBg}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Density Threshold</span>
                                <span className="font-mono">
                                    {settings.densityThreshold.toFixed(2)}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={0.5}
                                step={0.01}
                                value={settings.densityThreshold}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        densityThreshold: parseFloat(e.target.value),
                                    }))
                                }
                                className="volume-slider"
                            />
                        </div>

                        <div className={`px-3 py-2 rounded-lg space-y-1.5 ${cardBg}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Opacity</span>
                                <span className="font-mono">{settings.opacity.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min={0.05}
                                max={2.0}
                                step={0.05}
                                value={settings.opacity}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        opacity: parseFloat(e.target.value),
                                    }))
                                }
                                className="volume-slider"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                            {COLOR_PRESETS.map((preset) => (
                                <div
                                    key={preset.value}
                                    onClick={() =>
                                        setSettings((prev) => ({
                                            ...prev,
                                            colorMap: preset.value,
                                        }))
                                    }
                                    className={`py-2.5 text-center rounded-lg cursor-pointer transition ${
                                        settings.colorMap === preset.value ? activeBtnBg : btnBg
                                    }`}
                                >
                                    {preset.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-[1px] bg-current opacity-15" />

                    {/* Volume dimensions and format */}
                    <div className="space-y-2">
                        <div className="font-semibold text-sm">Volume Format</div>
                        <div className="grid grid-cols-3 gap-1.5">
                            {(['x', 'y', 'z'] as const).map((axis) => (
                                <input
                                    key={axis}
                                    className={`px-2 py-1.5 w-full rounded-lg text-center outline-none ${cardBg}`}
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

                        <select
                            className={`w-full px-3 py-2 rounded-lg outline-none ${cardBg}`}
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
                </div>
            )}
        </div>
    );
};

export default ClippingBoxUI;