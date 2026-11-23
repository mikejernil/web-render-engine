import React, { useState } from 'react';

import {
    AppstoreAddOutlined,
    CodeSandboxOutlined,
    DeploymentUnitOutlined,
} from '@ant-design/icons';

import { ModelType, SampleModel } from '../types';
import { SAMPLE_MODELS } from '../utils/sampleModels';

interface SampleSelectorProps {
    theme: 'light' | 'dark';
    onSelectSample: (sample: SampleModel) => void;
}

// Category tabs order matching UI layout
const FILTER_TABS: Array<{ label: string; value: 'all' | ModelType }> = [
    { label: 'All', value: 'all' },
    { label: 'Vol', value: 'volume' },
    { label: 'Splat', value: 'splat' },
    { label: 'OBJ', value: 'obj' },
    { label: 'FBX', value: 'fbx' },
    { label: 'GLB', value: 'glb' },
];

// Pick a placeholder icon for volume samples
const getVolumeIcon = (id: string) => {
    if (id.includes('sphere')) return <DeploymentUnitOutlined className="text-3xl opacity-80" />;
    if (id.includes('gyroid')) return <AppstoreAddOutlined className="text-3xl opacity-80" />;
    return <CodeSandboxOutlined className="text-3xl opacity-80" />;
};

/** Grid selector for built-in sample models. */
const SampleSelector: React.FC<SampleSelectorProps> = ({ theme, onSelectSample }) => {
    const [activeFilter, setActiveFilter] = useState<'all' | ModelType>('all');

    const visibleSamples =
        activeFilter === 'all'
            ? SAMPLE_MODELS
            : SAMPLE_MODELS.filter((sample) => sample.type === activeFilter);

    const cardStyle =
        theme === 'dark'
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-black/10 hover:bg-black/20 text-black';

    return (
        <div className="flex flex-col gap-2.5 w-full">
            {/* Category filter pills */}
            <div className="grid grid-cols-6 gap-1">
                {FILTER_TABS.map((tab) => {
                    const isActive = activeFilter === tab.value;
                    return (
                        <div
                            key={tab.value}
                            onClick={() => setActiveFilter(tab.value)}
                            className={`py-1.5 text-center text-xs rounded-md cursor-pointer select-none transition ${
                                isActive
                                    ? theme === 'dark'
                                        ? 'bg-white/30 text-white font-bold'
                                        : 'bg-black/30 text-black font-bold'
                                    : theme === 'dark'
                                      ? 'bg-white/10 text-white/75 hover:bg-white/15'
                                      : 'bg-black/10 text-black/75 hover:bg-black/15'
                            }`}
                        >
                            {tab.label}
                        </div>
                    );
                })}
            </div>

            {/* Scroll wrapper kept separate so CSS grid rows never collapse */}
            <div className="max-h-72 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-2.5">
                    {visibleSamples.map((sample) => (
                        <div
                            key={sample.id}
                            onClick={() => onSelectSample(sample)}
                            className={`p-1.5 rounded-xl cursor-pointer select-none transition flex flex-col ${cardStyle}`}
                        >
                            <div className="relative aspect-[4/3] w-full rounded-lg bg-black/15 flex items-center justify-center overflow-hidden shrink-0">
                                {sample.thumbnail ? (
                                    <img
                                        src={sample.thumbnail}
                                        alt={sample.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    getVolumeIcon(sample.id)
                                )}
                                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] uppercase font-semibold rounded bg-black/60 text-white">
                                    {sample.type === 'volume' ? 'VOL' : sample.type}
                                </span>
                            </div>
                            <div className="pt-1.5 px-1 text-xs font-bold truncate">
                                {sample.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SampleSelector;