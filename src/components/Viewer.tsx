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
import { Model } from '../types';
import Skybox from './Skybox';
import VolumetricRenderer, { type DataFormat } from './VolumetricRenderer';

interface ViewerProps {
    models: Model[];
    canvasRef: React.RefObject<HTMLCanvasElement>;
    volumeDimensions: { x: number; y: number; z: number };
    volumeDataType: DataFormat;
}

const Viewer: React.FC<ViewerProps> = ({ models, canvasRef, volumeDimensions, volumeDataType }) => {
    const { theme } = useTheme();

    return (
        <Canvas
            ref={canvasRef}
            style={{
                width: '100vw',
                height: '100vh',
            }}
            gl={{ preserveDrawingBuffer: true }}
            camera={{ position: [0, 2, 4] }}
        >
            <ambientLight />
            {models.map((model, index) => (
                <Models key={index} model={model} volumeDimensions={volumeDimensions} volumeDataType={volumeDataType} />
            ))}
            <GizmoHelper alignment="bottom-right" margin={[60, 60]} renderPriority={1}>
                <GizmoViewport
                    axisColors={
                        theme === 'dark' ? ['#fff', '#fff', '#fff'] : ['#000', '#000', '#000']
                    }
                    labelColor={theme === 'dark' ? 'black' : 'white'}
                />
            </GizmoHelper>
            <Grid
                position={[0, 0.01, 0]}
                args={[10, 10]}
                cellSize={0.5}
                cellThickness={0.5}
                cellColor={theme === 'light' ? '#333' : '#ddd'}
                sectionSize={5}
                sectionThickness={1.5}
                sectionColor={theme === 'light' ? '#333' : '#ddd'}
                fadeDistance={25}
                fadeStrength={2}
                followCamera={false}
                infiniteGrid={true}
            />
            <Skybox type="HDRI" />
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls
                makeDefault
                maxPolarAngle={Math.PI / 1.6}
                minDistance={1}
                maxDistance={30}
                enablePan={true}
            />
        </Canvas>
    );
};

export default Viewer;

function Box() {
    return (
        <mesh>
            <boxGeometry />
            <meshStandardMaterial />
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
function VolumeModel({ url, volumeDimensions, volumeDataType }: { url: string; volumeDimensions: { x: number; y: number; z: number }; volumeDataType: DataFormat }) {
    const buffer = useLoader(FileLoader, url, (loader) =>
        (loader as FileLoader).setResponseType('arraybuffer'),
    ) as ArrayBuffer;
    
    const { volumeData, dimensions, format } = useMemo(() => {
        const dims: [number, number, number] = [volumeDimensions.x, volumeDimensions.y, volumeDimensions.z];
        
        let data: Uint8Array | Uint16Array | Uint32Array | Float32Array;
        if (volumeDataType === 'uint16') {
            data = new Uint16Array(buffer);
        } else if (volumeDataType === 'uint32') {
            data = new Uint32Array(buffer);
        } else if (volumeDataType === 'float32') {
            data = new Float32Array(buffer);
        } else {
            data = new Uint8Array(buffer);
        }
        
        return {
            volumeData: data,
            dimensions: dims,
            format: volumeDataType,
        };
    }, [buffer, volumeDimensions, volumeDataType]);
    
    return <VolumetricRenderer volumeData={volumeData} dimensions={dimensions} format={format} />;
}

function Models({ model, volumeDimensions, volumeDataType }: { model: Model; volumeDimensions: { x: number; y: number; z: number }; volumeDataType: DataFormat }) {
    return (
        <Suspense fallback={<Box />}>
            {model.type === 'splat' && (
                <TransformControls mode="translate">
                    <Splat alphaTest={0.1} position={[0, 0, 0]} src={model.url} />
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
                    <VolumeModel url={model.url} volumeDimensions={volumeDimensions} volumeDataType={volumeDataType} />
                </TransformControls>
            )}
        </Suspense>
    );
}
