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
    const [load, setLoad] = useState(false);

    const [models, setModels] = useState<
        {
            url: string;
            name: string;
            type: 'splat' | 'obj' | 'fbx';
        }[]
    >([]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            let type: 'splat' | 'obj' | 'fbx' = 'obj';

            if (file.name.endsWith('.splat')) type = 'splat';
            else if (file.name.endsWith('.fbx')) type = 'fbx';
            else if (file.name.endsWith('.obj')) type = 'obj';
            else return alert('Unsupported file format');

            setModels([...models, { url: fileUrl, name: file.name, type }]);
        }
    };

    const loadUrlModel = () => {
        if (url) {
            let type: 'splat' | 'obj' | 'fbx' = 'obj';
            if (url.endsWith('.splat')) type = 'splat';
            else if (url.endsWith('.fbx')) type = 'fbx';
            else if (url.endsWith('.obj')) type = 'obj';
            else return alert('Unsupported URL file format');

            setModels([...models, { url, name: url.split('/').pop() ?? '', type }]);
        }
    };

    if (load) {
        loadUrlModel();
        setLoad(false);
    }

    const { theme } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    return (
        <>
            <div className="fixed top-0 left-0 z-10">
                <div className="flex p-2 flex-col gap-2">
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
                                    accept=".splat,.fbx,.obj,.glb"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Viewer models={models} canvasRef={canvasRef} />
            <div className={`flex gap-2 px-4 py-2 justify-center fixed top-0 right-0 z-10`}>
                <ThemeSwitch />
                <Screenshot canvasRef={canvasRef} theme={theme} />
            </div>
            <Socials />
        </>
    );
}

export default App;
