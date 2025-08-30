import { useCallback, useRef, useState } from 'react';

import ModelLoader from './components/ModelLoader';
import Screenshot from './components/Screenshot';
import Socials from './components/Socials';
import ThemeSwitch from './components/ThemeSwitch';
import Viewer from './components/Viewer';

import { Model } from './types';

function App() {
    const [models, setModels] = useState<Model[]>([]);
    const [showHelpers, setShowHelpers] = useState<boolean>(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleModelAdd = useCallback((newModel: Model) => {
        setModels((prevModels) => {
            if (prevModels.some((model) => model.url === newModel.url)) {
                alert(`Model "${newModel.name}" has already been loaded.`);
                return prevModels;
            }
            return [...prevModels, newModel];
        });
    }, []);

    return (
        <div className="w-screen h-screen overflow-hidden">
            <ModelLoader onModelAdd={handleModelAdd} />
            <Viewer models={models} canvasRef={canvasRef} showHelpers={showHelpers} />
            <div className="fixed top-2 right-2 z-10 flex items-center gap-2">
                <ThemeSwitch />
                <Screenshot canvasRef={canvasRef} setShowHelpers={setShowHelpers} />
            </div>
            <Socials />
        </div>
    );
}

export default App;
