import React, { useState } from 'react';

import { ClippingBoxFaces, VolumeColorPreset, VolumeSettings } from '../types';
import { CLIPPING_FACE_CONTROLS_METADATA, INITIAL_CLIPPING_BOX_FACES } from '../utils/clippingBox';

/** Props for ClippingBoxUI. */
export interface ClippingBoxUIProps {
    settings: VolumeSettings;
    setSettings: React.Dispatch<React.SetStateAction<VolumeSettings>>;
    theme: 'light' | 'dark';
}

const MINIMUM_FACE_SEPARATION = 0.05;

/** UI panel for volume clipping and appearance controls. */
const ClippingBoxUI: React.FC<ClippingBoxUIProps> = ({ settings, setSettings, theme }) => {
    const [isPanelExpanded, setIsPanelExpanded] = useState(true);

    const updateClippingFaceBound = (
        faceKey: keyof ClippingBoxFaces,
        rawSliderValue: number,
        boundType: 'minimum' | 'maximum',
        pairedFaceKey: keyof ClippingBoxFaces,
    ) => {
        setSettings((previousSettings) => {
            const pairedBoundValue = previousSettings.faces[pairedFaceKey];
            const clampedValue =
                boundType === 'minimum'
                    ? Math.min(rawSliderValue, pairedBoundValue - MINIMUM_FACE_SEPARATION)
                    : Math.max(rawSliderValue, pairedBoundValue + MINIMUM_FACE_SEPARATION);

            return {
                ...previousSettings,
                faces: {
                    ...previousSettings.faces,
                    [faceKey]: Number(clampedValue.toFixed(3)),
                },
            };
        });
    };

    const resetAllClippingFaces = () => {
        setSettings((previousSettings) => ({
            ...previousSettings,
            faces: { ...INITIAL_CLIPPING_BOX_FACES },
        }));
    };

    const panelSurfaceClasses =
        theme === 'light'
            ? 'bg-white/90 text-gray-900 border-gray-300'
            : 'bg-zinc-900/90 text-gray-100 border-zinc-700';

    const inputSurfaceClasses =
        theme === 'light'
            ? 'bg-gray-100 border-gray-300 text-gray-900'
            : 'bg-zinc-800 border-zinc-600 text-gray-100';

    return (
        <div
            className={`fixed top-14 right-2 z-20 w-80 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all ${panelSurfaceClasses}`}
        >
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold tracking-wide uppercase">
                    Volumetric Clipping Box
                </span>
                <button
                    type="button"
                    onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                    className="px-2 py-1 text-xs rounded border border-current opacity-80 hover:opacity-100"
                >
                    {isPanelExpanded ? 'Hide' : 'Show'}
                </button>
            </div>

            {isPanelExpanded && (
                <div className="mt-3 space-y-3 text-xs max-h-[75vh] overflow-y-auto pr-1">
                    <div className="space-y-1.5 border-b border-current/15 pb-3">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span>Show Volumetric Object</span>
                            <input
                                type="checkbox"
                                checked={settings.showVolume}
                                onChange={(event) =>
                                    setSettings((previous) => ({
                                        ...previous,
                                        showVolume: event.target.checked,
                                    }))
                                }
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <span>Show Clipping Box Wireframe</span>
                            <input
                                type="checkbox"
                                checked={settings.showClippingBox}
                                onChange={(event) =>
                                    setSettings((previous) => ({
                                        ...previous,
                                        showClippingBox: event.target.checked,
                                    }))
                                }
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <span>Show Outer Reference Cube</span>
                            <input
                                type="checkbox"
                                checked={settings.showOuterReferenceBox}
                                onChange={(event) =>
                                    setSettings((previous) => ({
                                        ...previous,
                                        showOuterReferenceBox: event.target.checked,
                                    }))
                                }
                            />
                        </label>
                    </div>

                    <div className="space-y-2 border-b border-current/15 pb-3">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">Box Face Clipping Bounds</span>
                            <button
                                type="button"
                                onClick={resetAllClippingFaces}
                                className="px-2 py-0.5 text-[11px] rounded border border-current/40 hover:border-current"
                            >
                                Reset Box
                            </button>
                        </div>

                        {CLIPPING_FACE_CONTROLS_METADATA.map((controlItem) => {
                            const currentFaceValue = settings.faces[controlItem.faceKey];
                            return (
                                <div key={controlItem.faceKey} className="space-y-0.5">
                                    <div className="flex justify-between text-[11px]">
                                        <span>{controlItem.displayLabel}</span>
                                        <span className="font-mono">
                                            {currentFaceValue.toFixed(2)}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={-1.0}
                                        max={1.0}
                                        step={0.01}
                                        value={currentFaceValue}
                                        onChange={(event) =>
                                            updateClippingFaceBound(
                                                controlItem.faceKey,
                                                parseFloat(event.target.value),
                                                controlItem.boundType,
                                                controlItem.pairedFaceKey,
                                            )
                                        }
                                        className="w-full cursor-pointer accent-cyan-500"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-2">
                        <span className="font-semibold block">Raycasting Appearance</span>

                        <div className="space-y-0.5">
                            <div className="flex justify-between text-[11px]">
                                <span>Density Threshold</span>
                                <span className="font-mono">
                                    {settings.densityThreshold.toFixed(2)}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0.01}
                                max={0.95}
                                step={0.01}
                                value={settings.densityThreshold}
                                onChange={(event) =>
                                    setSettings((previous) => ({
                                        ...previous,
                                        densityThreshold: parseFloat(event.target.value),
                                    }))
                                }
                                className="w-full cursor-pointer accent-cyan-500"
                            />
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex justify-between text-[11px]">
                                <span>Volume Opacity</span>
                                <span className="font-mono">{settings.opacity.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min={0.05}
                                max={2.0}
                                step={0.05}
                                value={settings.opacity}
                                onChange={(event) =>
                                    setSettings((previous) => ({
                                        ...previous,
                                        opacity: parseFloat(event.target.value),
                                    }))
                                }
                                className="w-full cursor-pointer accent-cyan-500"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <span>Colormap</span>
                            <select
                                value={settings.colorPreset}
                                onChange={(event) =>
                                    setSettings((previous) => ({
                                        ...previous,
                                        colorPreset: event.target.value as VolumeColorPreset,
                                    }))
                                }
                                className={`rounded border px-2 py-1 text-xs ${inputSurfaceClasses}`}
                            >
                                <option value="anatomical">Anatomical</option>
                                <option value="viridis">Viridis</option>
                                <option value="thermal">Thermal</option>
                                <option value="grayscale">Grayscale</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClippingBoxUI;
