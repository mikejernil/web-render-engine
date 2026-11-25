import { useRef, useState } from 'react';

import {
    CloudUploadOutlined,
    PlusCircleOutlined,
    UploadOutlined,
} from '@ant-design/icons';

import ClippingBoxUI from './components/ClippingBoxUI';
import Hierarchy from './components/Hierarchy';
import SampleSelector from './components/SampleSelector';
import Screenshot from './components/Screenshot';
import Socials from './components/Socials';
import ThemeSwitch from './components/ThemeSwitch';
import Viewer from './components/Viewer';

import { INITIAL_VOLUME_SETTINGS } from './utils/clippingBox';

import { useTheme } from './context/ThemeContext';
import { Model, ModelType, SampleModel, VolumeSettings } from './types';

// Resolve model type from file extension
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
        const modelWithId = {
            ...newModel,
            id: `model_${Date.now()}_${Math.random()}`,
        };
        const updatedModels = [...models, modelWithId];
        setModels(updatedModels);
        setSelectedModelIndex(updatedModels.length - 1);
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
        } as Model);
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
        } as Model);
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
        } as Model);
    };

    const handleDeleteModel = (id: string) => {
        const index = models.findIndex((m) => m.id === id);
        if (index === -1) return;

        const updatedModels = models.filter((_, i) => i !== index);
        setModels(updatedModels);
        if (selectedModelIndex === index) {
            setSelectedModelIndex(updatedModels.length > 0 ? 0 : null);
        } else if (selectedModelIndex !== null && selectedModelIndex > index) {
            setSelectedModelIndex(selectedModelIndex - 1);
        }
    };

    const { theme } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const selectedModel = selectedModelIndex !== null ? models[selectedModelIndex] : null;
    const isVolumeFocused = selectedModel?.type === 'volume';

    const panelBg =
        theme === 'dark'
            ? 'bg-neutral-900/75 text-white border-white/10'
            : 'bg-black/15 text-black border-black/10';
    const buttonBg =
        theme === 'dark'
            ? 'bg-white/15 hover:bg-white/25 text-white'
            : 'bg-black/15 hover:bg-black/25 text-black';
    const inputStyle =
        theme === 'dark'
            ? 'bg-white/15 placeholder:text-white/50 border-white/15 text-white'
            : 'bg-black/20 placeholder:text-black/50 border-black/20 text-black';

    return (
        <>
            <div className="flex flex-col gap-2 fixed top-2 left-2 z-10 w-72">
                <div
                    className={`text-3xl font-bold select-none ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                >
                    Web Render Engine
                </div>

                <div
                    className={`p-2.5 gap-2 flex items-center justify-center rounded-lg border backdrop-blur-md cursor-pointer select-none ${panelBg}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <PlusCircleOutlined />
                    <span>{isMenuOpen ? 'Close' : 'Load model'}</span>
                </div>

                {isMenuOpen && (
                    <div
                        className={`p-3 rounded-xl border backdrop-blur-xl flex flex-col gap-3 ${panelBg}`}
                    >
                        <input
                            className={`px-3.5 py-2 w-full rounded-lg border border-solid outline-none ${inputStyle}`}
                            placeholder="Place Url..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />

                        <div className="flex gap-2 w-full">
                            <div
                                className={`h-10 px-4 gap-2 flex items-center justify-center rounded-lg cursor-pointer select-none transition ${buttonBg}`}
                                onClick={handleLoadUrl}
                            >
                                <CloudUploadOutlined />
                                <span>Load</span>
                            </div>
                            <div
                                className={`flex-1 h-10 p-2 gap-2 flex items-center justify-center rounded-lg cursor-pointer select-none transition ${buttonBg}`}
                                onClick={() => setShowSamples(!showSamples)}
                            >
                                <UploadOutlined />
                                <span>{showSamples ? 'Hide Samples' : 'Sample Files'}</span>
                            </div>
                        </div>

                        {showSamples && (
                            <SampleSelector theme={theme} onSelectSample={handleSelectSample} />
                        )}

                        <div className="flex items-center justify-center">
                            <div
                                className={`flex-grow h-[1px] mr-2 ${
                                    theme === 'light' ? 'bg-black/40' : 'bg-white/40'
                                }`}
                            />
                            <span className="text-sm">or</span>
                            <div
                                className={`flex-grow h-[1px] ml-2 ${
                                    theme === 'light' ? 'bg-black/40' : 'bg-white/40'
                                }`}
                            />
                        </div>

                        <input
                            className={`w-full block text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:cursor-pointer ${
                                theme === 'dark'
                                    ? 'file:bg-white/25 file:text-white text-white/75'
                                    : 'file:bg-black/25 file:text-black/80 text-black/75'
                            }`}
                            type="file"
                            accept=".splat,.fbx,.obj,.glb,.gltf,.raw,.vol"
                            onChange={handleFileUpload}
                        />
                    </div>
                )}

                <Hierarchy
                    models={models}
                    selectedModelIndex={selectedModelIndex}
                    onSelectModel={setSelectedModelIndex}
                    onDeleteModel={handleDeleteModel}
                />
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