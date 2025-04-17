import { useCallback, useRef, useState } from 'react';

import ModelLoader from './components/ModelLoader';
import Screenshot from './components/Screenshot';
import Socials from './components/Socials';
import ThemeSwitch from './components/ThemeSwitch';
import Viewer from './components/Viewer';

import { useTheme } from './context/ThemeContext';
import { Model } from './types';

function App() {
    const [models, setModels] = useState<Model[]>([]);
    const { theme } = useTheme();
    const [showHelpers, setShowHelpers] = useState<boolean>(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleModelAdd = useCallback((newModel: Model) => {
        // Prevent duplicate url
        setModels((prevModels) => {
            if (prevModels.some((model) => model.url === newModel.url)) {
                alert(`Model with URL ${newModel.name} already loaded.`);
                return prevModels;
            }
            return [...prevModels, newModel];
        });
    }, []); // No dependencies, setModels state updater form ensures safety

    return (
        <>
            <div className="relative w-screen h-screen overflow-hidden">
                <ModelLoader onModelAdd={handleModelAdd} />
                <Viewer models={models} canvasRef={canvasRef} showHelpers={showHelpers} />
                <div className={`flex gap-2 justify-center fixed top-2 right-2 z-10`}>
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
