import React, { Suspense, useEffect, useMemo, useState } from 'react';

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

    const [isClickDrag, setIsClickDragging] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let activePointerId: number | null = null;
        let hasDragged = false;

        const onPointerDown = (event: PointerEvent) =>
        {
            if (event.button !== 0) return;
            
            activePointerId = event.pointerId;
            hasDragged = false;
            setIsClickDragging(false);
            console.log('Pointer down on canvas:', event.pointerId);
        };

        const onPointerMove = (event: PointerEvent) =>
        {
            if (
                event.pointerId === activePointerId &&
                (event.buttons & 1) !== 0 &&
                !hasDragged
            )
            {
                hasDragged = true;
                setIsClickDragging(true);
                console.log('Canvas is being dragged:', event.pointerId);
            }
        };

        const finishDrag = (event: PointerEvent) =>
        {
            if (event.pointerId !== activePointerId) return;
            activePointerId = null;
            hasDragged = false;
            setIsClickDragging(false);
            console.log('Canvas pointer released or canceled:', event.pointerId);
        };

        canvas.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', finishDrag);

        return () => {
            canvas.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', finishDrag);
        };
    }, [canvasRef]);

    return (
        <div className="w-screen h-screen" data-canvas-dragging={isClickDrag}>
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
                        isClickDragging={isClickDrag}
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
    isClickDragging,
    isSelected,
}: {
    model: Model;
    volumeSettings: VolumeSettings;
    isClickDragging: boolean;
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
            isClickDragging={isClickDragging}
            isSelected={isSelected}
        />
    );
}

function Models({
    model,
    volumeSettings,
    isClickDragging,
    isSelected,
    onSelect,
}: {
    model: Model;
    volumeSettings: VolumeSettings;
    isClickDragging: boolean;
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
                            isClickDragging={isClickDragging}
                            isSelected={isSelected}
                        />
                    )}
                </group>
            </PivotControls>
        </Suspense>
    );
}