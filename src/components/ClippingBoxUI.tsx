import React, { useEffect, useState } from 'react';

import { ClippingBoxFaces, VolumeSettings } from '../types';
import { INITIAL_CLIPPING_BOX_FACES } from '../utils/clippingBox';
import { DEFAULT_ISO_VALUE, RENDER_FX } from './VolumetricRenderer';

export interface ClippingBoxUIProps {
    settings: VolumeSettings;
    setSettings: React.Dispatch<React.SetStateAction<VolumeSettings>>;
    theme: 'light' | 'dark';
}

const MIN_FACE_GAP = 0.05;

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

/** UI panel for volume clipping box bounds. */
const ClippingBoxUI: React.FC<ClippingBoxUIProps> = ({ settings, setSettings, theme }) => {
    const [open, setOpen] = useState(true);

    //
    const activeFx = settings.activeFx ?? 0;
    const wireframe = settings.wireframe ?? false;
    const isoValue = settings.isoValue ?? DEFAULT_ISO_VALUE;
    const { hasWireframe = false, hasIsoValue = false } = RENDER_FX[activeFx] || RENDER_FX[0];

    useEffect(() => {
        if (!hasWireframe) {
            setSettings((prev) => ({ ...prev, wireframe: false }));
            return;
        }
    }, [hasWireframe, setSettings]);

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

    const resetFaces = () => {
        setSettings((prev) => ({
            ...prev,
            faces: { ...INITIAL_CLIPPING_BOX_FACES },
        }));
    };

    return (
        <div
            className={`fixed top-14 right-2 z-10 w-64 rounded-xl border p-3 backdrop-blur-md text-xs ${
                theme === 'light'
                    ? 'bg-white/80 text-black border-black/10'
                    : 'bg-black/80 text-white border-white/10'
            }`}
        >
            <div className="flex items-center justify-between font-bold">
                <span>Volumetric Controls</span>
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="px-2 py-0.5 rounded border border-current"
                >
                    {open ? 'Hide' : 'Show'}
                </button>
            </div>

            {open && (
                <div className="mt-3 space-y-2">
                    <div className="space-y-1">
                        <span className="font-semibold">Render FX</span>
                        <div className="flex gap-1">
                            {RENDER_FX.map(({ name }, index) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() =>
                                        setSettings((prev) => ({ ...prev, activeFx: index }))
                                    }
                                    className={`flex-1 px-2 py-1 rounded border border-current ${
                                        activeFx === index ? 'font-bold' : 'opacity-50'
                                    }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {hasWireframe && (
                        <label className="flex items-center justify-between cursor-pointer">
                            <span>Wireframe</span>
                            <input
                                type="checkbox"
                                checked={wireframe}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        wireframe: e.target.checked,
                                    }))
                                }
                            />
                        </label>
                    )}

                    {hasIsoValue && (
                        <div className="space-y-0.5">
                            <div className="flex justify-between">
                                <span>ISO</span>
                                <span className="font-mono">{isoValue}</span>
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={254}
                                step={1}
                                value={isoValue}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        isoValue: Number(e.target.value),
                                    }))
                                }
                                className="w-full cursor-pointer accent-current"
                            />
                        </div>
                    )}

                    <hr className="border-current opacity-20" />

                    <label className="flex items-center justify-between cursor-pointer">
                        <span>Show Box</span>
                        <input
                            type="checkbox"
                            checked={settings.showClippingBox}
                            onChange={(e) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    showClippingBox: e.target.checked,
                                }))
                            }
                        />
                    </label>

                    <div className="flex items-center justify-between pt-1">
                        <span className="font-semibold">Bounds</span>
                        <button
                            type="button"
                            onClick={resetFaces}
                            className="px-2 py-0.5 rounded border border-current text-[11px]"
                        >
                            Reset
                        </button>
                    </div>

                    {FACE_CONTROLS.map(({ key, label, isMin, pairedKey }) => (
                        <div key={key} className="space-y-0.5">
                            <div className="flex justify-between">
                                <span>{label}</span>
                                <span className="font-mono">{settings.faces[key].toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min={-1}
                                max={1}
                                step={0.01}
                                value={settings.faces[key]}
                                onChange={(e) =>
                                    updateFace(key, parseFloat(e.target.value), isMin, pairedKey)
                                }
                                className="w-full cursor-pointer accent-current"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClippingBoxUI;
