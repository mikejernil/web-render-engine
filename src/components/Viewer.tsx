import React, { Suspense } from 'react';

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
import Skybox from './Skybox';

interface Model {
    url: string;
    name: string;
    type: 'splat' | 'obj' | 'fbx';
}

interface ViewerProps {
    models: Model[];
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Viewer: React.FC<ViewerProps> = ({ models, canvasRef }) => {
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
                <Models key={index} model={model} />
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
function Models({ model }: { model: Model }) {
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
        </Suspense>
    );
}
