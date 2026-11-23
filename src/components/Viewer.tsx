import React, { Suspense, useMemo } from 'react';

import { FileLoader } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import {
    GizmoHelper,
    GizmoViewport,
    Grid,
    OrbitControls,
    PivotControls,
    Splat,
    TransformControls,
    useGLTF,
} from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';

import { useTheme } from '../context/ThemeContext';
import { Model, VolumeSettings } from '../types';
import Skybox from './Skybox';
import VolumetricRenderer from './VolumetricRenderer';

interface ViewerProps {
    models: Model[];
    canvasRef: React.RefObject<HTMLCanvasElement>;
    volumeSettings: VolumeSettings;
    selectedModelIndex: number | null;
    onSelectModel: (index: number | null) => void;
}

const Viewer: React.FC<ViewerProps> = ({
    models,
    canvasRef,
    volumeSettings,
    selectedModelIndex,
    onSelectModel,
}) => {
    const { theme } = useTheme();

    return (
        <div className="w-screen h-screen">
            <Canvas
                ref={canvasRef}
                gl={{ preserveDrawingBuffer: true }}
                camera={{ position: [5, 5, 5] }}
                onPointerMissed={() => onSelectModel(null)}
            >
                <Skybox type="HDRI" />
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 2, 2]} intensity={1} />
                <Grid
                    position={[0, -0.01, 0]}
                    args={[10.5, 10.5]}
                    cellColor={theme === 'light' ? 'black' : 'white'}
                    sectionColor={theme === 'light' ? 'black' : 'white'}
                    fadeDistance={20}
                    fadeStrength={1}
                    infiniteGrid
                />
                <OrbitControls makeDefault />
                <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
                    <GizmoViewport
                        axisColors={['#f43f5e', '#10b981', '#0ea5e9']}
                        labelColor="white"
                    />
                </GizmoHelper>

                {models.map((model, index) => (
                    <Models
                        key={model.id}
                        model={model}
                        volumeSettings={volumeSettings}
                        isSelected={selectedModelIndex === index}
                        onSelect={() => onSelectModel(index)}
                    />
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

function FbxModel({ url }: { url: string }) {
    const fbx = useLoader(FBXLoader, url);
    return <primitive object={fbx} />;
}

function ObjModel({ url }: { url: string }) {
    const obj = useLoader(OBJLoader, url);
    return <primitive object={obj} />;
}

function GlbModel({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

function VolumeModel({
    model,
    volumeSettings,
    isSelected,
}: {
    model: Model;
    volumeSettings: VolumeSettings;
    isSelected: boolean;
}) {
    const buffer = useLoader(FileLoader, model.url, (loader) =>
        (loader as FileLoader).setResponseType('arraybuffer'),
    ) as ArrayBuffer;

    const volumeData = useMemo(() => {
        const dataFormat = isSelected
            ? volumeSettings.dataFormat
            : (model.volumeDataFormat ?? volumeSettings.dataFormat);

        if (dataFormat === 'uint16') return new Uint16Array(buffer);
        if (dataFormat === 'uint32') return new Uint32Array(buffer);
        if (dataFormat === 'float32') return new Float32Array(buffer);
        return new Uint8Array(buffer);
    }, [buffer, isSelected, model.volumeDataFormat, volumeSettings.dataFormat]);

    const dimensions = isSelected
        ? volumeSettings.dimensions
        : (model.volumeDimensions ?? volumeSettings.dimensions);

    return (
        <VolumetricRenderer
            volumeData={volumeData}
            volumeSettings={volumeSettings}
            volumeDimensions={dimensions}
            isSelected={isSelected}
        />
    );
}

function Models({
    model,
    volumeSettings,
    isSelected,
    onSelect,
}: {
    model: Model;
    volumeSettings: VolumeSettings;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <Suspense fallback={<Box />}>
            <PivotControls
                scale={0.65}
                lineWidth={2.5}
                axisColors={['#f43f5e', '#10b981', '#0ea5e9']}
                hoveredColor="#ffffff"
                depthTest={false}
                disableAxes={!isSelected}
                disableSliders
                disableRotations={!isSelected}
                disableScaling
            >
                <group
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                    }}
                >
                    {model.type === 'splat' && <Splat src={model.url} />}
                    {model.type === 'fbx' && <FbxModel url={model.url} />}
                    {model.type === 'obj' && <ObjModel url={model.url} />}
                    {model.type === 'glb' && <GlbModel url={model.url} />}
                    {model.type === 'volume' && (
                        <VolumeModel
                            model={model}
                            volumeSettings={volumeSettings}
                            isSelected={isSelected}
                        />
                    )}
                </group>
            </PivotControls>
        </Suspense>
    );
}