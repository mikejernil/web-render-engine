import React, { Suspense, useMemo } from 'react';

import { FileLoader } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import {
    GizmoHelper,
    GizmoViewport,
    Grid,
    OrbitControls,
    PivotControls,
    Splat,
} from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';

import { useTheme } from '../context/ThemeContext';
import { Model, VolumeSettings } from '../types';
import Skybox from './Skybox';
import VolumetricObject from './VolumetricObject';
import VolumetricRenderer from './VolumetricRenderer';

interface ViewerProps {
    models: Model[];
    canvasRef: React.RefObject<HTMLCanvasElement>;
    volumeSettings: VolumeSettings;
    showHelpers: boolean;
}

const Viewer: React.FC<ViewerProps> = ({ models, canvasRef, volumeSettings, showHelpers }) => {
    const { theme } = useTheme();

    return (
        <div className="w-screen h-screen">
            <Canvas
                ref={canvasRef}
                gl={{ preserveDrawingBuffer: true }}
                camera={{ position: [5, 5, 5] }}
            >
                <Skybox type="HDRI" />
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 2, 2]} intensity={1} />
                {showHelpers && (
                    <Grid
                        position={[0, -0.01, 0]}
                        args={[10.5, 10.5]}
                        cellColor={theme == 'light' ? 'black' : 'white'}
                        sectionColor={theme == 'light' ? 'black' : 'white'}
                        fadeDistance={20}
                        fadeStrength={1}
                        infiniteGrid
                    />
                )}
                <OrbitControls makeDefault />
                {showHelpers && (
                    <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
                        <GizmoViewport
                            axisColors={
                                theme == 'light'
                                    ? ['black', 'black', 'black']
                                    : ['white', 'white', 'white']
                            }
                            labelColor={theme == 'light' ? 'white' : 'black'}
                        />
                    </GizmoHelper>
                )}

                <VolumetricObject settings={volumeSettings} showHelpers={showHelpers} />

                {models.map((model, index) => (
                    <Models key={index} model={model} showHelpers={showHelpers} />
                ))}
            </Canvas>
        </div>
    );
};

export default Viewer;

function Box() {
    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
}

// FBX Model component
function FbxModel({ url }: { url: string }) {
    const fbx = useLoader(FBXLoader, url);
    return <primitive object={fbx} />;
}

// OBJ Model component
function ObjModel({ url }: { url: string }) {
    const obj = useLoader(OBJLoader, url);
    return <primitive object={obj} />;
}

// GLB Model component
function GlbModel({ url }: { url: string }) {
    const gltf = useLoader(GLTFLoader, url);
    return <primitive object={gltf.scene} />;
}

// Raw volume component
function VolumeModel({ url }: { url: string }) {
    const buffer = useLoader(FileLoader, url, (loader) =>
        (loader as FileLoader).setResponseType('arraybuffer'),
    ) as ArrayBuffer;
    const volumeData = useMemo(() => new Uint8Array(buffer), [buffer]);
    return <VolumetricRenderer volumeData={volumeData} />;
}

function Models({ model, showHelpers }: { model: Model; showHelpers: boolean }) {
    return (
        <Suspense fallback={<Box />}>
            <PivotControls
                visible={showHelpers}
                enabled={showHelpers}
                scale={0.75}
                depthTest={false}
            >
                {model.type === 'splat' && <Splat src={model.url} />}
                {model.type === 'fbx' && <FbxModel url={model.url} />}
                {model.type === 'obj' && <ObjModel url={model.url} />}
                {model.type === 'glb' && <GlbModel url={model.url} />}
                {model.type === 'volume' && <VolumeModel url={model.url} />}
            </PivotControls>
        </Suspense>
    );
}
