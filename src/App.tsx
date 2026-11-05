import { useRef, useState } from 'react';

import { CloudUploadOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';

import ClippingBoxUI from './components/ClippingBoxUI';
import Screenshot from './components/Screenshot';
import Socials from './components/Socials';
import ThemeSwitch from './components/ThemeSwitch';
import Viewer from './components/Viewer';

import { INITIAL_VOLUME_SETTINGS, VolumeSettings } from './utils/clippingBox';

import { useTheme } from './context/ThemeContext';

function App() {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [load, setLoad] = useState(false);
    const [models, setModels] = useState<
        { url: string; name: string; type: 'splat' | 'obj' | 'fbx' }[]
    >([]);
    const [volumeSettings, setVolumeSettings] = useState<VolumeSettings>(INITIAL_VOLUME_SETTINGS);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            let type: 'splat' | 'obj' | 'fbx' = 'obj';
            if (file.name.endsWith('.splat')) type = 'splat';
            else if (file.name.endsWith('.fbx')) type = 'fbx';
            else if (file.name.endsWith('.obj')) type = 'obj';
            else {
                alert('Unsupported file format');
                return;
            }
            setModels([...models, { url: fileUrl, name: file.name, type }]);
        }
    };

    const loadUrlModel = () => {
        if (url) {
            let type: 'splat' | 'obj' | 'fbx' = 'obj';
            if (url.endsWith('.splat')) type = 'splat';
            else if (url.endsWith('.fbx')) type = 'fbx';
            else if (url.endsWith('.obj')) type = 'obj';
            else {
                alert('Unsupported URL file format');
                return;
            }
            setModels([...models, { url, name: url.split('/').pop() ?? '', type }]);
        }
    };

    if (load) {
        loadUrlModel();
        setLoad(false);
    }

    const { theme } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <div
                className={`${
                    theme === 'light' ? 'bg-gray-200 text-black' : 'bg-black text-white'
                } fixed top-3 left-3 z-50 font-bold p-2 rounded-lg`}
            >
                Web Render Engine
            </div>

            <button
                className={`${
                    theme === 'light' ? 'bg-gray-200 text-black' : 'bg-black text-white'
                } fixed z-50 font-semibold p-2 top-16 left-3 rounded-lg`}
                onClick={() => setOpen(!open)}
            >
                {open ? 'Close' : 'Load model'} <PlusCircleOutlined />
            </button>

            {open && (
                <div
                    className={`${
                        theme === 'light' ? 'bg-gray-200 text-black' : 'bg-black text-white'
                    } fixed z-50 font-semibold p-4 top-28 left-3 rounded-lg flex flex-col gap-2`}
                >
                    <input
                        type="text"
                        placeholder="Load model from URL"
                        className="p-2 rounded text-black"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button
                            className="p-2 bg-blue-600 text-white rounded"
                            onClick={() => setLoad(true)}
                        >
                            Load <CloudUploadOutlined />
                        </button>
                        <button
                            className="p-2 bg-green-600 text-white rounded"
                            onClick={() => {
                                setUrl(
                                    'https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat',
                                );
                                setLoad(true);
                            }}
                        >
                            Sample File
                        </button>
                    </div>
                    <div className="text-center">or</div>
                    <label className="cursor-pointer p-2 border border-current rounded text-center">
                        <UploadOutlined /> Upload File
                        <input type="file" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
            )}

            <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
                <Screenshot canvasRef={canvasRef} theme={theme} />
                <ThemeSwitch />
            </div>

            <ClippingBoxUI
                settings={volumeSettings}
                setSettings={setVolumeSettings}
                theme={theme}
            />

            <Socials />
            <Viewer models={models} canvasRef={canvasRef} volumeSettings={volumeSettings} />
        </div>
    );
}

export default App;
