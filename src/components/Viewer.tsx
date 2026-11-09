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

import { Model } from '../types';
import { VolumeSettings } from '../utils/clippingBox';
import Skybox from './Skybox';
import VolumetricObject from './VolumetricObject';
import VolumetricRenderer from './VolumetricRenderer';

interface ViewerProps {
    models: Model[];
    canvasRef: React.RefObject<HTMLCanvasElement>;
    volumeSettings: VolumeSettings;
}

const Viewer: React.FC<ViewerProps> = ({ models, canvasRef, volumeSettings }) => {
    return (
        <div className="w-screen h-screen">
            <Canvas ref={canvasRef} gl={{ preserveDrawingBuffer: true }}>
                <Skybox type="HDRI" />
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 2, 2]} intensity={1} />
                <Grid infiniteGrid />
                <OrbitControls makeDefault />
                <GizmoHelper alignment="bottom-right" margin={[80, 100]}>
                    <GizmoViewport />
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

function Loader() {
    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
}

function FbxModel({ url }: { url: string }) {
    const fbx = useLoader(FBXLoader, url);
    return <primitive object={fbx} />;
}

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
        <Suspense fallback={<Loader />}>
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
