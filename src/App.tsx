import { useRef, useState } from 'react';

import { CloudUploadOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';

import ClippingBoxUI from './components/ClippingBoxUI';
import Screenshot from './components/Screenshot';
import Socials from './components/Socials';
import ThemeSwitch from './components/ThemeSwitch';
import Viewer from './components/Viewer';

import { INITIAL_VOLUME_SETTINGS } from './utils/clippingBox';

import { useTheme } from './context/ThemeContext';
import { Model, ModelType, VolumeSettings } from './types';

const getModelType = (path: string): ModelType | null => {
    const lower = path.toLowerCase();
    if (lower.endsWith('.splat')) return 'splat';
    if (lower.endsWith('.fbx')) return 'fbx';
    if (lower.endsWith('.obj')) return 'obj';
    if (lower.endsWith('.raw') || lower.endsWith('.vol')) return 'volume';
    return null;
};

function App() {
    const [viewGS, setViewGS] = useState(false);
    const [url, setUrl] = useState('');
    const [load, setLoad] = useState(false);

    const [models, setModels] = useState<Model[]>([]);
    const [volumeSettings, setVolumeSettings] = useState<VolumeSettings>(INITIAL_VOLUME_SETTINGS);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            const type = getModelType(file.name);
            if (!type) return alert('Unsupported file format');

            setModels([...models, { url: fileUrl, name: file.name, type }]);
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

            setModels([...models, { url, name: pathname.split('/').pop() ?? '', type }]);
        }
    };

    if (load) {
        loadUrlModel();
        setLoad(false);
    }

    const { theme } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    return (
        <>
            <div className="flex flex-col gap-2 fixed top-2 left-2 z-10">
                <div
                    className={`text-3xl font-bold select-none ${
                        theme == 'dark' ? 'text-white' : 'text-black'
                    }`}
                >
                    Web Render Engine
                </div>
                <div
                    className={`p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${
                        theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                    }`}
                    onClick={() => setViewGS(!viewGS)}
                >
                    <PlusCircleOutlined />
                    {viewGS ? `Close` : `Load model`}
                </div>
                {viewGS && (
                    <>
                        <input
                            className={`px-4 py-2 w-full rounded-md border-2 border-solid backdrop-blur-xl ${theme == 'dark' ? 'bg-white/25 placeholder:text-white/50 border-white/10' : 'bg-black/25 placeholder:text-black/50 border-black/10'}`}
                            placeholder="Place Url..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <div className="flex gap-2 w-full">
                            <div
                                className={`h-10 p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                                onClick={() => setLoad(true)}
                            >
                                <CloudUploadOutlined />
                                {'Load '}
                            </div>
                            <div
                                className={`w-full p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                                onClick={() => {
                                    setUrl(
                                        'https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat',
                                    );
                                    setLoad(true);
                                }}
                            >
                                <UploadOutlined />
                                {'Sample File'}
                            </div>
                        </div>
                        <div className="">
                            <div className="flex items-center justify-center">
                                <div
                                    className={`flex-grow h-[.1rem] m-2 backdrop-blur-md ${theme == 'light' ? 'bg-black/50' : 'bg-white/50'}`}
                                />
                                <div
                                    className={`${theme == 'light' ? 'text-black' : 'text-white'}`}
                                >
                                    or
                                </div>
                                <div
                                    className={`flex-grow h-[.1rem] m-2 backdrop-blur-md ${theme == 'light' ? 'bg-black/50' : 'bg-white/50'}`}
                                />
                            </div>
                            <input
                                className={`w-64 block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-2 file:text-sm file:font-semibold ${theme == 'dark' ? 'file:bg-white/25 file:text-white/50 text-white/75 file:border-white/10' : 'file:bg-black/25 file:text-black/50 text-black/75 file:border-black/10'}`}
                                type="file"
                                accept=".splat,.fbx,.obj,.glb,.raw,.vol"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="fixed top-2 right-2 z-10 flex gap-2">
                <ThemeSwitch />
                <Screenshot canvasRef={canvasRef} theme={theme} />
            </div>

            <ClippingBoxUI
                settings={volumeSettings}
                setSettings={setVolumeSettings}
                theme={theme}
            />

            <Viewer models={models} canvasRef={canvasRef} volumeSettings={volumeSettings} />
            <Socials />
        </>
    );
}

export default App;
