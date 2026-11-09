import React, { Suspense, useMemo } from 'react';

import { FileLoader } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import {
    GizmoHelper,
    GizmoViewport,
    Grid,
    OrbitControls,
    Splat,
    TransformControls,
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
}

const Viewer: React.FC<ViewerProps> = ({ models, canvasRef, volumeSettings }) => {
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
                <Grid
                    position={[0, -0.01, 0]}
                    args={[10.5, 10.5]}
                    cellColor={theme == 'light' ? '#000' : '#fff'}
                    sectionColor={theme == 'light' ? '#ff0000' : '#00ffff'}
                    fadeDistance={20}
                    fadeStrength={1}
                    infiniteGrid
                />
                <OrbitControls makeDefault />
                <GizmoHelper alignment="bottom-right" margin={[80, 100]}>
                    <GizmoViewport
                        axisColors={
                            theme == 'light'
                                ? ['#ff2060', '#20df80', '#2080ff']
                                : ['#9d4b4b', '#2f7f4f', '#3b5b9d']
                        }
                        labelColor={theme == 'light' ? 'black' : 'white'}
                    />
                </GizmoHelper>

                <VolumetricObject settings={volumeSettings} />

                {models.map((model, index) => (
                    <Models key={index} model={model} />
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

// Raw volume component
function VolumeModel({ url }: { url: string }) {
    const buffer = useLoader(FileLoader, url, (loader) =>
        (loader as FileLoader).setResponseType('arraybuffer'),
    ) as ArrayBuffer;
    const volumeData = useMemo(() => new Uint8Array(buffer), [buffer]);
    return <VolumetricRenderer volumeData={volumeData} />;
}

function Models({ model }: { model: Model }) {
    return (
        <Suspense fallback={<Box />}>
            {model.type === 'splat' && (
                <TransformControls mode="translate">
                    <Splat src={model.url} />
                </TransformControls>
            )}
            {model.type === 'fbx' && (
                <TransformControls mode="translate">
                    <FbxModel url={model.url} />
                </TransformControls>
            )}
            {model.type === 'obj' && (
                <TransformControls mode="translate">
                    <ObjModel url={model.url} />
                </TransformControls>
            )}
            {model.type === 'volume' && (
                <TransformControls mode="translate">
                    <VolumeModel url={model.url} />
                </TransformControls>
            )}
        </Suspense>
    );
}
