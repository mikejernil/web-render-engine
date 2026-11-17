import { useRef, useState } from 'react';

import {
    AppstoreOutlined,
    CloudUploadOutlined,
    PlusCircleOutlined,
} from '@ant-design/icons';

import ClippingBoxUI from './components/ClippingBoxUI';
import SampleSelector from './components/SampleSelector';
import Screenshot from './components/Screenshot';
import Socials from './components/Socials';
import ThemeSwitch from './components/ThemeSwitch';
import Viewer from './components/Viewer';

import { INITIAL_VOLUME_SETTINGS } from './utils/clippingBox';

import { useTheme } from './context/ThemeContext';
import { Model, ModelType, SampleModel, VolumeSettings } from './types';

const getModelType = (path: string): ModelType | null => {
    const lower = path.toLowerCase();
    if (lower.endsWith('.splat')) return 'splat';
    if (lower.endsWith('.fbx')) return 'fbx';
    if (lower.endsWith('.obj')) return 'obj';
    if (lower.endsWith('.glb') || lower.endsWith('.gltf')) return 'glb';
    if (lower.endsWith('.raw') || lower.endsWith('.vol')) return 'volume';
    return null;
};

function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSamples, setShowSamples] = useState(false);
    const [url, setUrl] = useState('');

    const [models, setModels] = useState<Model[]>([]);
    const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(null);
    const [volumeSettings, setVolumeSettings] = useState<VolumeSettings>(INITIAL_VOLUME_SETTINGS);

    const addModel = (newModel: Model) => {
        setModels((prev) => {
            setSelectedModelIndex(prev.length);
            return [...prev, newModel];
        });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const type = getModelType(file.name);
        if (!type) return alert('Unsupported file format');

        addModel({
            url: URL.createObjectURL(file),
            name: file.name,
            type,
            ...(type === 'volume' && {
                volumeDimensions: volumeSettings.dimensions,
                volumeDataFormat: volumeSettings.dataFormat,
            }),
        });
    };

    const handleLoadUrl = () => {
        if (!url) return;

        let pathname = url;
        try {
            pathname = new URL(url, window.location.href).pathname;
        } catch (error) {
            console.error('Could not parse model URL, using it as-is:', url, error);
        }

        const type = getModelType(pathname);
        if (!type) return alert('Unsupported URL file format');

        addModel({
            url,
            name: pathname.split('/').pop() ?? 'Model',
            type,
            ...(type === 'volume' && {
                volumeDimensions: volumeSettings.dimensions,
                volumeDataFormat: volumeSettings.dataFormat,
            }),
        });
    };

    const handleSelectSample = (sample: SampleModel) => {
        const modelUrl = sample.createUrl ? sample.createUrl() : sample.url;
        if (!modelUrl) return;

        if (sample.type === 'volume') {
            setVolumeSettings((prev) => ({
                ...prev,
                dimensions: sample.volumeDimensions ?? prev.dimensions,
                dataFormat: sample.volumeDataFormat ?? prev.dataFormat,
            }));
        }

        addModel({
            url: modelUrl,
            name: sample.name,
            type: sample.type,
            ...(sample.type === 'volume' && {
                volumeDimensions: sample.volumeDimensions ?? volumeSettings.dimensions,
                volumeDataFormat: sample.volumeDataFormat ?? volumeSettings.dataFormat,
            }),
        });
    };

    const { theme } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const selectedModel = selectedModelIndex !== null ? models[selectedModelIndex] : null;
    const isVolumeFocused = selectedModel?.type === 'volume';

    const surfaceStyle =
        theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black';
    const inputStyle =
        theme === 'dark'
            ? 'bg-white/25 placeholder:text-white/50 border-white/10 text-white'
            : 'bg-black/25 placeholder:text-black/50 border-black/10 text-black';

    return (
        <>
            <div className="flex flex-col gap-2 fixed top-2 left-2 z-10">
                <div
                    className={`text-3xl font-bold select-none ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                >
                    Web Render Engine
                </div>
                <div
                    className={`p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${surfaceStyle}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <PlusCircleOutlined />
                    {isMenuOpen ? 'Close' : 'Load model'}
                </div>

                {isMenuOpen && (
                    <div className="flex flex-col gap-2 w-64">
                        <input
                            className={`px-4 py-2 w-full rounded-md border-2 border-solid backdrop-blur-xl ${inputStyle}`}
                            placeholder="Place Url..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <div className="flex gap-2 w-full">
                            <div
                                className={`h-10 px-3 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${surfaceStyle}`}
                                onClick={handleLoadUrl}
                            >
                                <CloudUploadOutlined />
                                <span>Load</span>
                            </div>
                            <div
                                className={`w-full p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${surfaceStyle}`}
                                onClick={() => setShowSamples(!showSamples)}
                            >
                                <AppstoreOutlined />
                                <span>{showSamples ? 'Hide Samples' : 'Sample Files'}</span>
                            </div>
                        </div>

                        {showSamples && (
                            <SampleSelector theme={theme} onSelectSample={handleSelectSample} />
                        )}

                        <div className="flex items-center justify-center">
                            <div
                                className={`flex-grow h-[.1rem] m-2 backdrop-blur-md ${
                                    theme === 'light' ? 'bg-black/50' : 'bg-white/50'
                                }`}
                            />
                            <div className={theme === 'light' ? 'text-black' : 'text-white'}>
                                or
                            </div>
                            <div
                                className={`flex-grow h-[.1rem] m-2 backdrop-blur-md ${
                                    theme === 'light' ? 'bg-black/50' : 'bg-white/50'
                                }`}
                            />
                        </div>

                        <input
                            className={`w-64 block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-2 file:text-sm file:font-semibold ${
                                theme === 'dark'
                                    ? 'file:bg-white/25 file:text-white/50 text-white/75 file:border-white/10'
                                    : 'file:bg-black/25 file:text-black/50 text-black/75 file:border-black/10'
                            }`}
                            type="file"
                            accept=".splat,.fbx,.obj,.glb,.gltf,.raw,.vol"
                            onChange={handleFileUpload}
                        />
                    </div>
                )}
            </div>

            <div className="fixed top-2 right-2 z-10 flex gap-2">
                <ThemeSwitch />
                <Screenshot canvasRef={canvasRef} theme={theme} />
            </div>

            {isVolumeFocused && (
                <ClippingBoxUI
                    settings={volumeSettings}
                    setSettings={setVolumeSettings}
                    theme={theme}
                />
            )}

            <Viewer
                models={models}
                canvasRef={canvasRef}
                volumeSettings={volumeSettings}
                selectedModelIndex={selectedModelIndex}
                onSelectModel={setSelectedModelIndex}
            />
            <Socials />
        </>
    );
}

export default App;