import { useRef, useState } from 'react';

import { CloudUploadOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';

import Screenshot from './components/Screenshot';
import Socials from './components/Socials';
import ThemeSwitch from './components/ThemeSwitch';
import Viewer from './components/Viewer';

import { useTheme } from './context/ThemeContext';

function App() {
    const [viewGS, setViewGS] = useState(false);
    const [url, setUrl] = useState('');
    const [sampleFileView, setSampleFileView] = useState(false);

    const [models, setModels] = useState<
        {
            url: string;
            name: string;
            type: 'splat' | 'obj' | 'fbx' | 'glb';
        }[]
    >([]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            let type: 'splat' | 'obj' | 'fbx' | 'glb' | null = null;

            if (file.name.endsWith('.splat')) type = 'splat';
            else if (file.name.endsWith('.fbx')) type = 'fbx';
            else if (file.name.endsWith('.obj')) type = 'obj';
            else if (file.name.endsWith('.glb')) type = 'glb';
            else return alert('Unsupported file format');

            setModels([...models, { url: fileUrl, name: file.name, type }]);
        }
    };

    const loadSampleFile = (type: 'splat' | 'obj' | 'fbx' | 'glb') => {
        const sampleUrls: Record<typeof type, string> = {
            splat: 'https://huggingface.co/cakewalk/splat-data/resolve/main/plush.splat',
            obj: 'https://huggingface.co/datasets/notHarshPrajapati/WRESamples/resolve/main/Fox.obj',
            fbx: 'https://huggingface.co/datasets/notHarshPrajapati/WRESamples/resolve/main/Imposter.fbx',
            glb: 'https://huggingface.co/datasets/notHarshPrajapati/WRESamples/resolve/main/Pikachu.glb',
        };
        const sampleUrl = sampleUrls[type];

        if (!sampleUrl) return alert('Unsupported sample type');

        setUrl(sampleUrl);
        setModels([...models, { url: sampleUrl, name: sampleUrl.split('/').pop() ?? '', type }]);
    };

    const loadFromUrl = () => {
        if (!url.trim()) {
            alert('Please enter a URL.');
            return;
        }

        let type: 'splat' | 'obj' | 'fbx' | 'glb' | null = null;

        if (url.endsWith('.splat')) type = 'splat';
        else if (url.endsWith('.fbx')) type = 'fbx';
        else if (url.endsWith('.obj')) type = 'obj';
        else if (url.endsWith('.glb')) type = 'glb';
        else
            return alert(
                'Unsupported file format in URL. Only .splat, .fbx, .obj, .glb are supported.',
            );

        setModels([...models, { url, name: url.split('/').pop() ?? '', type }]);
        setUrl(''); // clear after loading
    };

    const { theme } = useTheme();
    const [showHelpers, setShowHelpers] = useState<boolean>(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    return (
        <>
            <div className="relative w-screen h-screen">
                <div className="fixed top-2 left-2 z-10">
                    <div className="flex flex-col gap-1">
                        <span
                            className={`font-bold text-3xl ${theme == 'dark' ? ' text-white' : 'text-black'}`}
                        >
                            Web Render Engine
                        </span>
                        <div
                            className={`p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
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
                                        className={`w-full my-1 p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                                        onClick={() => setSampleFileView(true)}
                                    >
                                        <UploadOutlined />
                                        {'Sample File'}
                                    </div>
                                ) : (
                                    <div className="flex gap-2 my-1">
                                        <div
                                            className={`p-2 gap-1 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme == 'dark' ? 'bg-red-500 text-white' : 'bg-red-100 text-black'}`}
                                            onClick={() => setSampleFileView(false)}
                                        >
                                            <PlusCircleOutlined className="px-2 rotate-45" />
                                        </div>
                                        <div
                                            className={`p-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                                            onClick={() => loadSampleFile('splat')}
                                        >
                                            .splat
                                        </div>
                                        <div
                                            className={`p-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                                            onClick={() => loadSampleFile('fbx')}
                                        >
                                            .fbx
                                        </div>
                                        <div
                                            className={`p-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                                            onClick={() => loadSampleFile('obj')}
                                        >
                                            .obj
                                        </div>
                                        <div
                                            className={`p-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                                            onClick={() => loadSampleFile('glb')}
                                        >
                                            .glb
                                        </div>
                                    </div>
                                )}
                                <OrLine />
                                <div className="flex justify-between">
                                    <input
                                        className={`px-4 py-2 w-44 rounded-md border-2 border-solid backdrop-blur-xl ${theme == 'dark' ? 'bg-white/25 placeholder:text-white/50 border-white/10' : 'bg-black/25 placeholder:text-black/50 border-black/10'}`}
                                        placeholder="Place Url..."
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                    <div
                                        className={`h-10 w-20 p-2 gap-2 flex items-center justify-center rounded-md backdrop-blur-md cursor-pointer select-none ${theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                                        onClick={loadFromUrl}
                                    >
                                        <CloudUploadOutlined />
                                        {'Load '}
                                    </div>
                                </div>
                                <OrLine />
                                <input
                                    className={`w-64 block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-2 file:text-sm file:font-semibold ${theme == 'dark' ? 'file:bg-white/25 file:text-white/50 text-white/75 file:border-white/10' : 'file:bg-black/25 file:text-black/50 text-black/75 file:border-black/10'}`}
                                    type="file"
                                    accept=".splat,.fbx,.obj,.glb"
                                    onChange={handleFileUpload}
                                />
                            </>
                        )}
                    </div>
                </div>
                <Viewer models={models} canvasRef={canvasRef} showHelpers={showHelpers} />

                <div className={`flex gap-2 justify-center  fixed top-2 right-2 z-10`}>
                    <ThemeSwitch />
                    <Screenshot
                        canvasRef={canvasRef}
                        theme={theme}
                        setShowHelpers={setShowHelpers}
                    />
                </div>
                <Socials />
            </div>
        </>
    );
}

export default App;

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
