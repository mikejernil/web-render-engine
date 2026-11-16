import React, { useState } from 'react';

import { SlidersOutlined } from '@ant-design/icons';

import { ClippingBoxFaces, VolumeSettings, VolumeShapePreset } from '../types';
import { INITIAL_CLIPPING_BOX_FACES } from '../utils/clippingBox';
import { VOLUME_VARIATIONS } from '../utils/sampleModels';

export interface ClippingBoxUIProps {
    settings: VolumeSettings;
    setSettings: React.Dispatch<React.SetStateAction<VolumeSettings>>;
    theme: 'light' | 'dark';
}

const MINIMUM_FACE_SEPARATION = 0.05;

const COLOR_PRESETS: ReadonlyArray<{ id: VolumeColorPreset; label: string }> = [
    { id: 'anatomical', label: 'Anatomical' },
    { id: 'viridis', label: 'Viridis' },
    { id: 'thermal', label: 'Thermal' },
    { id: 'grayscale', label: 'Grayscale' },
];

/** UI panel for volume clipping and appearance controls. */
const MIN_GAP = 0.05;

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
    const [isOpen, setIsOpen] = useState(true);

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

    const resetFaces = () => {
        setSettings((prev) => ({
            ...prev,
            faces: { ...INITIAL_CLIPPING_BOX_FACES },
        }));
    };

    const setVolumeShape = (shapePreset: VolumeShapePreset) => {
        setSettings((previous) => ({
            ...previous,
            shapePreset,
            showVolume: true,
        }));
    };

    const glassContainerClass =
        theme === 'dark'
            ? 'bg-white/10 text-white border-white/10'
            : 'bg-black/10 text-black border-black/10';

    const glassButtonClass =
        theme === 'dark'
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-black/10 hover:bg-black/20 text-black';

    const activePillClass =
        theme === 'dark'
            ? 'bg-white/30 text-white font-semibold'
            : 'bg-black/25 text-black font-semibold';

    const sliderTrackClass =
        theme === 'dark' ? 'bg-white/25 accent-white' : 'bg-black/25 accent-black';

    const dividerClass = theme === 'light' ? 'bg-black/30' : 'bg-white/30';

    return (
        <div className="fixed top-14 right-2 z-10 w-72 flex flex-col gap-2 select-none">
            <div
                className={`p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer ${glassButtonClass}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <SlidersOutlined />
                {isOpen ? 'Close Clipping Box' : 'Volume Clipping'}
            </div>

            {isOpen && (
                <div
                    className={`p-3 rounded-md border border-solid backdrop-blur-md flex flex-col gap-2.5 text-xs max-h-[78vh] overflow-y-auto ${glassContainerClass}`}
                >
                    <div className="grid grid-cols-2 gap-1.5">
                        {VOLUME_VARIATIONS.map((variation) => {
                            const isSelected =
                                settings.showVolume && settings.shapePreset === variation.id;
                            return (
                                <div
                                    key={variation.id}
                                    onClick={() => setVolumeShape(variation.id)}
                                    className={`p-2 rounded-md cursor-pointer text-center transition-colors ${
                                        isSelected ? activePillClass : glassButtonClass
                                    }`}
                                >
                                    <div>{variation.name}</div>
                                    <div className="text-[10px] opacity-70">
                                        {variation.subtitle}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                        <div
                            onClick={() =>
                                setSettings((prev) => ({
                                    ...prev,
                                    showVolume: !prev.showVolume,
                                }))
                            }
                            className={`p-1.5 rounded-md cursor-pointer text-center transition-colors ${
                                settings.showVolume ? activePillClass : glassButtonClass
                            }`}
                        >
                            Volume
                        </div>
                        <div
                            onClick={() =>
                                setSettings((prev) => ({
                                    ...prev,
                                    showClippingBox: !prev.showClippingBox,
                                }))
                            }
                            className={`p-1.5 rounded-md cursor-pointer text-center transition-colors ${
                                settings.showClippingBox ? activePillClass : glassButtonClass
                            }`}
                        >
                            Clip Box
                        </div>
                        <div
                            onClick={() =>
                                setSettings((prev) => ({
                                    ...prev,
                                    showOuterReferenceBox: !prev.showOuterReferenceBox,
                                }))
                            }
                            className={`p-1.5 rounded-md cursor-pointer text-center transition-colors ${
                                settings.showOuterReferenceBox ? activePillClass : glassButtonClass
                            }`}
                        >
                            Bounds
                        </div>
                    </div>

                    <div className={`h-[1px] w-full ${dividerClass}`} />

                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Clip Faces</span>
                        <div
                            onClick={resetAllClippingFaces}
                            className={`px-2 py-1 rounded-md cursor-pointer ${glassButtonClass}`}
                        >
                            Reset
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        {CLIPPING_FACE_CONTROLS_METADATA.map((controlItem) => {
                            const currentFaceValue = settings.faces[controlItem.faceKey];
                            return (
                                <div
                                    key={controlItem.faceKey}
                                    className={`px-2.5 py-1.5 rounded-md flex flex-col gap-1 ${glassButtonClass}`}
                                >
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
                                        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${sliderTrackClass}`}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className={`h-[1px] w-full ${dividerClass}`} />

                    <div className="flex flex-col gap-1.5">
                        <div
                            className={`px-2.5 py-1.5 rounded-md flex flex-col gap-1 ${glassButtonClass}`}
                        >
                            <div className="flex justify-between text-[11px]">
                                <span>Density Threshold</span>
                                <span className="font-mono">
                                    {settings.densityThreshold.toFixed(2)}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0.01}
                                max={0.9}
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
                                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${sliderTrackClass}`}
                            />
                        </div>

                        <div
                            className={`px-2.5 py-1.5 rounded-md flex flex-col gap-1 ${glassButtonClass}`}
                        >
                            <div className="flex justify-between text-[11px]">
                                <span>Opacity</span>
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
                                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${sliderTrackClass}`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        {COLOR_PRESETS.map((preset) => (
                            <div
                                key={preset.id}
                                onClick={() =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        colorPreset: preset.id,
                                    }))
                                }
                                className={`p-1.5 rounded-md cursor-pointer text-center transition-colors ${
                                    settings.colorPreset === preset.id
                                        ? activePillClass
                                        : glassButtonClass
                                }`}
                            >
                                {preset.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClippingBoxUI;
