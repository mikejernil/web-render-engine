import React, { useState } from 'react';

import { CloudUploadOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';

import { useTheme } from '../context/ThemeContext';
import { Model, ModelType } from '../types';

interface ModelLoaderProps {
    onModelAdd: (model: Model) => void;
}

const sampleModels: { name: string; type: ModelType; url: string }[] = [
    {
        name: 'plush.splat',
        type: 'splat',
        url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/plush.splat',
    },
    {
        name: 'Pikachu.glb',
        type: 'glb',
        url: 'https://huggingface.co/datasets/notHarshPrajapati/WRESamples/resolve/main/Pikachu.glb',
    },
    {
        name: 'Fox.obj',
        type: 'obj',
        url: 'https://huggingface.co/datasets/notHarshPrajapati/WRESamples/resolve/main/Fox.obj',
    },
    {
        name: 'Imposter.fbx',
        type: 'fbx',
        url: 'https://huggingface.co/datasets/notHarshPrajapati/WRESamples/resolve/main/Imposter.fbx',
    },
];

const getModelTypeFromFilename = (filename: string): ModelType | null => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'splat':
            return 'splat';
        case 'fbx':
            return 'fbx';
        case 'obj':
            return 'obj';
        case 'glb':
            return 'glb';
        default:
            return null;
    }
};

function ModelLoader({ onModelAdd }: ModelLoaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState('');
    const { theme } = useTheme();

    const panelStyles = `backdrop-blur-md rounded-lg select-none transition-colors ${
        theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
    }`;

    const handleModelLoad = (model: Model) => {
        onModelAdd(model);
        setIsOpen(false);
        setUrl('');
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileType = getModelTypeFromFilename(file.name);
            if (!fileType) {
                alert('Unsupported file format. Please use .splat, .glb, .obj, or .fbx');
                return;
            }
            const fileUrl = URL.createObjectURL(file);
            handleModelLoad({ url: fileUrl, name: file.name, type: fileType });
            event.target.value = '';
        }
    };

    const loadFromUrl = () => {
        if (!url.trim()) return;
        const urlType = getModelTypeFromFilename(url);
        if (!urlType) {
            alert('Unsupported file format in URL. Please use .splat, .glb, .obj, or .fbx');
            return;
        }
        const name = url.split('/').pop() ?? 'model_from_url';
        handleModelLoad({ url, name, type: urlType });
    };

    return (
        <div className="fixed top-2 left-2 z-10 w-80">
            <div className="flex flex-col gap-2">
                <span
                    className={`font-bold text-3xl ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                >
                    Web Render Engine
                </span>
                <div
                    className={`${panelStyles} p-2 flex items-center justify-center gap-2 cursor-pointer`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <PlusCircleOutlined
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                    />
                    {isOpen ? 'Close' : 'Load Model'}
                </div>

                {isOpen && (
                    <div className={`${panelStyles} p-3 flex flex-col gap-3`}>
                        <div>
                            <p className="text-sm font-semibold mb-2">Load a Sample</p>
                            <div className="grid grid-cols-2 gap-2">
                                {sampleModels.map(({ name, type, url }) => (
                                    <button
                                        key={name}
                                        className={`p-2 rounded-md text-xs hover:bg-white/20 ${panelStyles}`}
                                        onClick={() => handleModelLoad({ name, url, type })}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <OrLine />

                        <div>
                            <p className="text-sm font-semibold mb-2">Load from URL</p>
                            <div className="flex gap-2">
                                <input
                                    className={`px-3 py-2 flex-grow rounded-md border-2 border-solid backdrop-blur-xl text-sm ${
                                        theme === 'dark'
                                            ? 'bg-white/25 placeholder:text-white/50 border-white/10'
                                            : 'bg-black/25 placeholder:text-black/50 border-black/10'
                                    }`}
                                    placeholder="https://.../model.glb"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && loadFromUrl()}
                                />
                                <button
                                    className={`w-20 p-2 flex-shrink-0 flex items-center justify-center gap-2 rounded-md hover:bg-white/20 ${panelStyles}`}
                                    onClick={loadFromUrl}
                                >
                                    <CloudUploadOutlined /> Load
                                </button>
                            </div>
                        </div>

                        <OrLine />

                        <label
                            className={`w-full block p-2 rounded-md cursor-pointer hover:bg-black/20 text-center ${panelStyles}`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <UploadOutlined /> Choose File
                            </span>
                            <input
                                className="hidden"
                                type="file"
                                accept=".splat,.fbx,.obj,.glb"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}

function OrLine() {
    const { theme } = useTheme();
    return (
        <div className="flex items-center my-1">
            <div
                className={`flex-grow h-px ${theme === 'light' ? 'bg-black/25' : 'bg-white/25'}`}
            />
            <div
                className={`px-2 text-xs uppercase ${theme === 'light' ? 'text-black/50' : 'text-white/50'}`}
            >
                or
            </div>
            <div
                className={`flex-grow h-px ${theme === 'light' ? 'bg-black/25' : 'bg-white/25'}`}
            />
        </div>
    );
}

export default ModelLoader;
