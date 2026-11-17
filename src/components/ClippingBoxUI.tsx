import React, { useState } from 'react';

import {
    BorderOuterOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    ReloadOutlined,
} from '@ant-design/icons';

import { ClippingBoxFaces, VolumeSettings } from '../types';
import { INITIAL_CLIPPING_BOX_FACES } from '../utils/clippingBox';

export interface ClippingBoxUIProps {
    settings: VolumeSettings;
    setSettings: React.Dispatch<React.SetStateAction<VolumeSettings>>;
    theme: 'light' | 'dark';
}

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
    const [open, setOpen] = useState(false);

    const surfaceStyle =
        theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black';
    const buttonStyle =
        theme === 'dark'
            ? 'bg-white/15 hover:bg-white/25 text-white'
            : 'bg-black/15 hover:bg-black/25 text-black';

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

    const toggleBoxVisibility = () => {
        setSettings((prev) => ({
            ...prev,
            showClippingBox: !prev.showClippingBox,
        }));
    };

    return (
        <div className="fixed top-14 right-2 z-10 flex flex-col items-end gap-2">
            <div
                className={`p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${surfaceStyle}`}
                onClick={() => setOpen(!open)}
            >
                <BorderOuterOutlined />
                <span>{open ? 'Close Clipping' : 'Clipping Box'}</span>
            </div>

            {open && (
                <div
                    className={`w-64 p-3 rounded-md backdrop-blur-md text-xs space-y-3 select-none ${surfaceStyle}`}
                >
                    <div className="flex gap-2">
                        <div
                            onClick={toggleBoxVisibility}
                            className={`flex-1 p-2 gap-1.5 flex items-center justify-center rounded-md cursor-pointer transition ${buttonStyle}`}
                        >
                            {settings.showClippingBox ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            <span>{settings.showClippingBox ? 'Box Visible' : 'Box Hidden'}</span>
                        </div>
                        <div
                            onClick={resetFaces}
                            className={`p-2 gap-1.5 flex items-center justify-center rounded-md cursor-pointer transition ${buttonStyle}`}
                        >
                            <ReloadOutlined />
                            <span>Reset</span>
                        </div>
                    </div>

                    <div className="space-y-2">
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