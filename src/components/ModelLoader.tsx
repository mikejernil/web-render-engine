import React, { useState } from 'react';

import { CloudUploadOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';

import { useTheme } from '../context/ThemeContext';
import { Model, ModelType } from '../types';

interface ModelLoaderProps {
    onModelAdd: (model: Model) => void;
}

function ModelLoader({ onModelAdd }: ModelLoaderProps) {
    const [viewGS, setViewGS] = useState(false);
    const [url, setUrl] = useState('');
    const [sampleFileView, setSampleFileView] = useState(false);
    const { theme } = useTheme();

    const getModelTypeFromFilename = (filename: string): ModelType | null => {
        if (filename.endsWith('.splat')) return 'splat';
        if (filename.endsWith('.fbx')) return 'fbx';
        if (filename.endsWith('.obj')) return 'obj';
        if (filename.endsWith('.glb')) return 'glb';
        return null;
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileType = getModelTypeFromFilename(file.name);
            if (!fileType) {
                alert('Unsupported file format');
                return;
            }
            const fileUrl = URL.createObjectURL(file);
            onModelAdd({ url: fileUrl, name: file.name, type: fileType });
            event.target.value = '';
        }
    };

    const loadSampleFile = (type: ModelType) => {
        const sampleUrls: Record<ModelType, string> = {
            splat: 'https://huggingface.co/cakewalk/splat-data/resolve/main/plush.splat',
            obj: 'https://huggingface.co/datasets/notHarshPrajapati/WRESamples/resolve/main/Fox.obj',
            fbx: 'https://huggingface.co/datasets/notHarshPrajapati/WRESamples/resolve/main/Imposter.fbx',
            glb: 'https://huggingface.co/datasets/notHarshPrajapati/WRESamples/resolve/main/Pikachu.glb',
        };
        const sampleUrl = sampleUrls[type];
        const name = sampleUrl.split('/').pop() ?? `sample.${type}`;
        onModelAdd({ url: sampleUrl, name: name, type });
        // Close sample view and main view
        setSampleFileView(false);
        setViewGS(false);
    };

    const loadFromUrl = () => {
        if (!url.trim()) {
            alert('Please enter a URL.');
            return;
        }
        const urlType = getModelTypeFromFilename(url);
        if (!urlType) {
            alert('Unsupported file format in URL. Only .splat, .fbx, .obj, .glb are supported.');
            return;
        }
        const name = url.split('/').pop() ?? 'model_from_url';
        onModelAdd({ url, name: name, type: urlType });
        // Clear and clse after loading
        setUrl('');
        setViewGS(false);
    };

    return (
        <div className="fixed top-2 left-2 z-10">
            <div className="flex flex-col gap-1">
                <span
                    className={`font-bold text-3xl ${theme === 'dark' ? ' text-white' : 'text-black'}`}
                >
                    Web Render Engine
                </span>
                <div
                    className={`p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                    onClick={() => setViewGS(!viewGS)}
                >
                    <PlusCircleOutlined
                        className={`transition-transform duration-250 ${viewGS ? 'rotate-45' : 'rotate-0'}`}
                    />
                    {viewGS ? `Close` : `Load model`}
                </div>
                {viewGS && (
                    <>
                        {!sampleFileView ? (
                            <div
                                className={`w-full my-1 p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                                onClick={() => setSampleFileView(true)}
                            >
                                <UploadOutlined />
                                {'Sample File'}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2 my-1">
                                <div
                                    className={`p-2 gap-1 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme === 'dark' ? 'bg-red-500 text-white' : 'bg-red-100 text-black'}`}
                                    onClick={() => setSampleFileView(false)}
                                >
                                    <PlusCircleOutlined className="px-2 rotate-45" />
                                </div>
                                {(['splat', 'fbx', 'obj', 'glb'] as ModelType[]).map((type) => (
                                    <div
                                        key={type}
                                        className={`p-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                                        onClick={() => loadSampleFile(type)}
                                    >
                                        .{type}
                                    </div>
                                ))}
                            </div>
                        )}
                        <OrLine />
                        <div className="flex justify-between gap-2">
                            <input
                                className={`px-4 py-2 flex-grow rounded-md border-2 border-solid backdrop-blur-xl ${theme === 'dark' ? 'bg-white/25 placeholder:text-white/50 border-white/10 text-white' : 'bg-black/25 placeholder:text-black/50 border-black/10 text-black'}`}
                                placeholder="Paste Url..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && loadFromUrl()}
                            />
                            <div
                                className={`h-10 w-20 p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none flex-shrink-0 ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                                onClick={loadFromUrl}
                            >
                                <CloudUploadOutlined />
                                {'Load'}
                            </div>
                        </div>
                        <OrLine />
                        <label
                            className={`w-full block text-sm p-2 rounded-md backdrop-blur-md cursor-pointer select-none ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <UploadOutlined /> Choose File...
                            </span>
                            <input
                                className="hidden"
                                type="file"
                                accept=".splat,.fbx,.obj,.glb"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </>
                )}
            </div>
        </div>
    );
}

export default ModelLoader;

function OrLine() {
    const { theme } = useTheme();
    return (
        <div className="flex items-center justify-center my-1">
            <div
                className={`flex-grow h-[.1rem] mx-2 backdrop-blur-md ${
                    theme == 'light' ? 'bg-black/50' : 'bg-white/50'
                }`}
            />
            <div className={`${theme == 'light' ? 'text-black' : 'text-white'}`}>or</div>
            <div
                className={`flex-grow h-[.1rem] mx-2 backdrop-blur-md ${
                    theme == 'light' ? 'bg-black/50' : 'bg-white/50'
                }`}
            />
        </div>
    );
}
