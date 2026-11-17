import React, { useState } from 'react';

import { ModelType, SampleModel } from '../types';
import { SAMPLE_MODELS } from '../utils/sampleModels';

interface SampleSelectorProps {
    theme: 'light' | 'dark';
    onSelectSample: (sample: SampleModel) => void;
}

const FILTER_TABS: Array<{ label: string; value: 'all' | ModelType }> = [
    { label: 'All', value: 'all' },
    { label: 'Splat', value: 'splat' },
    { label: 'OBJ', value: 'obj' },
    { label: 'FBX', value: 'fbx' },
    { label: 'Volume', value: 'volume' },
];

/** Visual grid for picking sample models. */
const SampleSelector: React.FC<SampleSelectorProps> = ({ theme, onSelectSample }) => {
    const [activeFilter, setActiveFilter] = useState<'all' | ModelType>('all');

    const visibleSamples =
        activeFilter === 'all'
            ? SAMPLE_MODELS
            : SAMPLE_MODELS.filter((sample) => sample.type === activeFilter);

    const cardStyle =
        theme === 'dark'
            ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
            : 'bg-black/10 hover:bg-black/20 border-black/10 text-black';

    return (
        <div className="flex flex-col gap-2 w-64">
            <div className="flex gap-1">
                {FILTER_TABS.map((tab) => {
                    const isActive = activeFilter === tab.value;
                    return (
                        <div
                            key={tab.value}
                            onClick={() => setActiveFilter(tab.value)}
                            className={`flex-1 py-1 text-center text-xs rounded-md cursor-pointer select-none backdrop-blur-md ${
                                isActive
                                    ? theme === 'dark'
                                        ? 'bg-white/30 text-white font-semibold'
                                        : 'bg-black/30 text-black font-semibold'
                                    : theme === 'dark'
                                      ? 'bg-white/10 text-white/70'
                                      : 'bg-black/10 text-black/70'
                            }`}
                        >
                            {tab.label}
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {visibleSamples.map((sample) => (
                    <div
                        key={sample.id}
                        onClick={() => onSelectSample(sample)}
                        className={`group relative rounded-md border overflow-hidden cursor-pointer select-none backdrop-blur-md transition ${cardStyle}`}
                    >
                        <div className="relative h-20 w-full bg-black/20 flex items-center justify-center overflow-hidden">
                            <img
                                src={sample.thumbnail}
                                alt={sample.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-black/60 text-white">
                                {sample.type}
                            </span>
                        </div>
                        <div className="px-2 py-1 text-xs truncate">{sample.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SampleSelector;