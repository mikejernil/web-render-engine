import { useRef, useState } from 'react';

import { CloudUploadOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';

import ClippingBoxUI from './components/ClippingBoxUI';
import Screenshot from './components/Screenshot';
import Socials from './components/Socials';
import ThemeSwitch from './components/ThemeSwitch';
import Viewer from './components/Viewer';

import { INITIAL_VOLUME_SETTINGS } from './utils/clippingBox';
import { SAMPLE_MODELS, VOLUME_VARIATIONS } from './utils/sampleModels';

import { useTheme } from './context/ThemeContext';
import { Model, ModelType, VolumeSettings } from './types';

type SampleFilterTab = 'all' | 'splat' | 'obj' | 'fbx' | 'glb' | 'volume';

const SAMPLE_FILTER_TABS: ReadonlyArray<{ id: SampleFilterTab; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'volume', label: 'Vol' },
    { id: 'splat', label: 'Splat' },
    { id: 'obj', label: 'OBJ' },
    { id: 'fbx', label: 'FBX' },
    { id: 'glb', label: 'GLB' },
];

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
    const [viewGS, setViewGS] = useState(false);
    const [showSamples, setShowSamples] = useState(false);
    const [activeSampleTab, setActiveSampleTab] = useState<SampleFilterTab>('all');
    const [url, setUrl] = useState('');
    const [load, setLoad] = useState(false);
    const [showHelpers, setShowHelpers] = useState(true);

    const [models, setModels] = useState<Model[]>([]);
    const [volumeSettings, setVolumeSettings] = useState<VolumeSettings>(INITIAL_VOLUME_SETTINGS);

    const addSceneModel = (newModel: Model) => {
        setModels((previousModels) => {
            if (previousModels.some((item) => item.url === newModel.url)) {
                return previousModels;
            }
            return [...previousModels, newModel];
        });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            const type = getModelType(file.name);
            if (!type) return alert('Unsupported file format');

            addSceneModel({ url: fileUrl, name: file.name, type });
        }
    };

    const loadUrlModel = () => {
        if (url) {
            // match on the path only, so query params and hashes don't hide the extension
            let pathname = url;
            try {
                pathname = new URL(url, window.location.href).pathname;
            } catch (error) {
                // not a parseable URL, use the raw string
                console.error('Could not parse model URL, using it as-is:', url, error);
            }

            const type = getModelType(pathname);
            if (!type) return alert('Unsupported URL file format');

            addSceneModel({ url, name: pathname.split('/').pop() ?? '', type });
        }
    };

    if (load) {
        loadUrlModel();
        setLoad(false);
    }

    const { theme } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const filteredSampleModels = SAMPLE_MODELS.filter(
        (item) => activeSampleTab === 'all' || item.type === activeSampleTab,
    );

    const showVolumeCards = activeSampleTab === 'all' || activeSampleTab === 'volume';

    const glassButtonClass =
        theme == 'dark'
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-black/10 hover:bg-black/20 text-black';

    return (
        <>
            <div className="flex flex-col gap-2 fixed top-2 left-2 z-10 w-72">
                <div
                    className={`text-3xl font-bold select-none ${
                        theme == 'dark' ? 'text-white' : 'text-black'
                    }`}
                >
                    Web Render Engine
                </div>
                <div
                    className={`p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${glassButtonClass}`}
                    onClick={() => setViewGS(!viewGS)}
                >
                    <PlusCircleOutlined />
                    {viewGS ? `Close` : `Load model`}
                </div>
                {viewGS && (
                    <div
                        className={`p-3 rounded-md backdrop-blur-md flex flex-col gap-2.5 ${
                            theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                        }`}
                    >
                        <input
                            className={`px-4 py-2 w-full rounded-md border-2 border-solid backdrop-blur-xl ${
                                theme == 'dark'
                                    ? 'bg-white/25 placeholder:text-white/50 border-white/10'
                                    : 'bg-black/25 placeholder:text-black/50 border-black/10'
                            }`}
                            placeholder="Place Url..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <div className="flex gap-2 w-full">
                            <div
                                className={`h-10 p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${glassButtonClass}`}
                                onClick={() => setLoad(true)}
                            >
                                <CloudUploadOutlined />
                                {'Load '}
                            </div>
                            <div
                                className={`w-full p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${glassButtonClass}`}
                                onClick={() => setShowSamples(!showSamples)}
                            >
                                <UploadOutlined />
                                {showSamples ? 'Hide Samples' : 'Sample Files'}
                            </div>
                        </div>

                        {showSamples && (
                            <div className="flex flex-col gap-2 pt-1">
                                <div className="grid grid-cols-6 gap-1 text-[10px]">
                                    {SAMPLE_FILTER_TABS.map((tab) => (
                                        <div
                                            key={tab.id}
                                            onClick={() => setActiveSampleTab(tab.id)}
                                            className={`py-1 rounded text-center cursor-pointer select-none ${
                                                activeSampleTab === tab.id
                                                    ? theme == 'dark'
                                                        ? 'bg-white/30 font-bold'
                                                        : 'bg-black/25 font-bold'
                                                    : glassButtonClass
                                            }`}
                                        >
                                            {tab.label}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-0.5">
                                    {showVolumeCards &&
                                        VOLUME_VARIATIONS.map((volItem) => (
                                            <div
                                                key={volItem.id}
                                                onClick={() =>
                                                    setVolumeSettings((prev) => ({
                                                        ...prev,
                                                        shapePreset: volItem.id,
                                                        showVolume: true,
                                                    }))
                                                }
                                                className={`p-1.5 rounded-md cursor-pointer select-none flex flex-col gap-1 ${glassButtonClass}`}
                                            >
                                                <div className="h-16 w-full rounded flex items-center justify-center bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-amber-500/30 relative overflow-hidden">
                                                    <div
                                                        className={
                                                            volItem.id === 'sphere'
                                                                ? 'w-10 h-10 rounded-full border-2 border-current opacity-80'
                                                                : 'w-9 h-9 rounded-sm border-2 border-current opacity-80 rotate-12'
                                                        }
                                                    />
                                                    <span className="absolute top-1 right-1 text-[9px] px-1 rounded bg-black/50 text-white uppercase">
                                                        vol
                                                    </span>
                                                </div>
                                                <div className="text-xs font-semibold truncate px-0.5">
                                                    {volItem.name}
                                                </div>
                                            </div>
                                        ))}

                                    {filteredSampleModels.map((sample) => (
                                        <div
                                            key={sample.name}
                                            onClick={() =>
                                                addSceneModel({
                                                    name: sample.name,
                                                    type: sample.type,
                                                    url: sample.url,
                                                })
                                            }
                                            className={`p-1.5 rounded-md cursor-pointer select-none flex flex-col gap-1 ${glassButtonClass}`}
                                        >
                                            <div className="h-16 w-full rounded overflow-hidden relative bg-black/20">
                                                <img
                                                    src={sample.thumbnail}
                                                    alt={sample.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                                <span className="absolute top-1 right-1 text-[9px] px-1 rounded bg-black/60 text-white uppercase">
                                                    {sample.type}
                                                </span>
                                            </div>
                                            <div className="text-xs font-semibold truncate px-0.5">
                                                {sample.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-center">
                                <div
                                    className={`flex-grow h-[.1rem] m-2 backdrop-blur-md ${
                                        theme == 'light' ? 'bg-black/50' : 'bg-white/50'
                                    }`}
                                />
                                <div
                                    className={`${theme == 'light' ? 'text-black' : 'text-white'}`}
                                >
                                    or
                                </div>
                                <div
                                    className={`flex-grow h-[.1rem] m-2 backdrop-blur-md ${
                                        theme == 'light' ? 'bg-black/50' : 'bg-white/50'
                                    }`}
                                />
                            </div>
                            <input
                                className={`w-full block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-2 file:text-sm file:font-semibold ${
                                    theme == 'dark'
                                        ? 'file:bg-white/25 file:text-white/50 text-white/75 file:border-white/10'
                                        : 'file:bg-black/25 file:text-black/50 text-black/75 file:border-black/10'
                                }`}
                                type="file"
                                accept=".splat,.fbx,.obj,.glb,.raw,.vol"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed top-2 right-2 z-10 flex gap-2">
                <ThemeSwitch />
                <Screenshot canvasRef={canvasRef} theme={theme} setShowHelpers={setShowHelpers} />
            </div>

            <ClippingBoxUI
                settings={volumeSettings}
                setSettings={setVolumeSettings}
                theme={theme}
            />

            <Viewer
                models={models}
                canvasRef={canvasRef}
                volumeSettings={volumeSettings}
                showHelpers={showHelpers}
            />
            <Socials />
        </>
    );
}

export default App;
