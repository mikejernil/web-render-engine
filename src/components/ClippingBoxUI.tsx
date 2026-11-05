import React, { useState } from 'react';

import {
    ClippingBoxFaces,
    INITIAL_CLIPPING_BOX_FACES,
    VolumeColorPreset,
    VolumeSettings,
} from '../utils/clippingBox';

interface ClippingBoxUIProps {
    settings: VolumeSettings;
    setSettings: React.Dispatch<React.SetStateAction<VolumeSettings>>;
    theme: 'light' | 'dark';
}

const FACE_SLIDER_LIST: Array<{
    key: keyof ClippingBoxFaces;
    label: string;
}> = [
    { key: 'xMinusSideFace', label: 'X- Left Face' },
    { key: 'xPlusSideFace', label: 'X+ Right Face' },
    { key: 'yMinusBottomFace', label: 'Y- Bottom Face' },
    { key: 'yPlusTopFace', label: 'Y+ Top Face' },
    { key: 'zMinusBackFace', label: 'Z- Back Face' },
    { key: 'zPlusFrontFace', label: 'Z+ Front Face' },
];

const ClippingBoxUI: React.FC<ClippingBoxUIProps> = ({ settings, setSettings, theme }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleFaceSliderChange = (faceKey: keyof ClippingBoxFaces, newValue: number) => {
        setSettings((prev) => ({
            ...prev,
            faces: {
                ...prev.faces,
                [faceKey]: newValue,
            },
        }));
    };

    const resetClippingFaces = () => {
        setSettings((prev) => ({
            ...prev,
            faces: { ...INITIAL_CLIPPING_BOX_FACES },
        }));
    };

    const containerStyle =
        theme === 'light'
            ? 'bg-gray-200/90 text-black'
            : 'bg-black/85 text-white border border-gray-700';

    return (
        <div
            className={`fixed top-16 right-3 z-50 w-64 p-3 rounded-lg shadow-lg text-xs ${containerStyle}`}
        >
            <div className="flex justify-between items-center font-bold">
                <span>Volume Clipping Box</span>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-2 py-0.5 rounded bg-blue-600 text-white"
                >
                    {isOpen ? 'Hide' : 'Show'}
                </button>
            </div>

            {isOpen && (
                <div className="mt-3 flex flex-col gap-2">
                    <label className="flex justify-between items-center cursor-pointer">
                        <span>Show Volume</span>
                        <input
                            type="checkbox"
                            checked={settings.showVolume}
                            onChange={(e) =>
                                setSettings((prev) => ({ ...prev, showVolume: e.target.checked }))
                            }
                        />
                    </label>

                    <label className="flex justify-between items-center cursor-pointer">
                        <span>Show Clipping Box</span>
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

                    <hr className="border-gray-500/40 my-1" />

                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Clip Faces</span>
                        <button
                            onClick={resetClippingFaces}
                            className="px-1.5 py-0.5 bg-gray-500 text-white rounded text-[10px]"
                        >
                            Reset
                        </button>
                    </div>

                    {FACE_SLIDER_LIST.map(({ key, label }) => (
                        <div key={key} className="flex flex-col">
                            <div className="flex justify-between">
                                <span>{label}</span>
                                <span>{settings.faces[key].toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min={-1}
                                max={1}
                                step={0.02}
                                value={settings.faces[key]}
                                onChange={(e) =>
                                    handleFaceSliderChange(key, parseFloat(e.target.value))
                                }
                            />
                        </div>
                    ))}

                    <hr className="border-gray-500/40 my-1" />

                    <div className="flex flex-col">
                        <div className="flex justify-between">
                            <span>Threshold</span>
                            <span>{settings.densityThreshold.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min={0.05}
                            max={0.8}
                            step={0.01}
                            value={settings.densityThreshold}
                            onChange={(e) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    densityThreshold: parseFloat(e.target.value),
                                }))
                            }
                        />
                    </div>

                    <div className="flex justify-between items-center mt-1">
                        <span>Color</span>
                        <select
                            value={settings.colorPreset}
                            onChange={(e) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    colorPreset: e.target.value as VolumeColorPreset,
                                }))
                            }
                            className="p-1 rounded text-black bg-white"
                        >
                            <option value="anatomical">Anatomical</option>
                            <option value="viridis">Viridis</option>
                            <option value="thermal">Thermal</option>
                            <option value="grayscale">Grayscale</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClippingBoxUI;
