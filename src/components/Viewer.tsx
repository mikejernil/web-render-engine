import React, { Suspense } from 'react';

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
import { Model } from '../types';
import Skybox from './Skybox';

interface ViewerProps {
    models: Model[];
    canvasRef: React.RefObject<HTMLCanvasElement>;
    showHelpers: boolean;
}

interface LoadedModelProps {
    model: Model;
    showHelpers: boolean;
}

const Viewer: React.FC<ViewerProps> = ({ models, canvasRef, showHelpers }) => {
    const { theme } = useTheme();

    return (
        <Canvas
            ref={canvasRef}
            gl={{ preserveDrawingBuffer: true }}
            camera={{ position: [0, 2, 5], fov: 60 }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 7.5]} intensity={1.5} />

            {models.map((model, index) => (
                <LoadedModel
                    key={`${model.url}-${index}`}
                    model={model}
                    showHelpers={showHelpers}
                />
            ))}

            <OrbitControls
                makeDefault
                maxPolarAngle={Math.PI / 1.75}
                minDistance={1}
                maxDistance={50}
            />

            {showHelpers && (
                <>
                    <Grid
                        position={[0, 0, 0]}
                        args={[10.5, 10.5]}
                        cellColor={theme === 'light' ? '#6f6f6f' : '#999'}
                        sectionColor={theme === 'light' ? '#333' : '#ddd'}
                        fadeDistance={30}
                        infiniteGrid
                    />
                    <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                        <GizmoViewport
                            axisColors={
                                theme === 'dark'
                                    ? ['#f0f0f0', '#f0f0f0', '#f0f0f0']
                                    : ['#333', '#333', '#333']
                            }
                            labelColor={theme === 'dark' ? '#fff' : '#000'}
                        />
                    </GizmoHelper>
                </>
            )}
            <Skybox type="HDRI" />
        </Canvas>
    );
};

function FbxModel({ url }: { url: string }) {
    const fbx = useLoader(FBXLoader, url);
    return <primitive object={fbx} scale={0.01} />;
}

function ObjModel({ url }: { url: string }) {
    const obj = useLoader(OBJLoader, url);
    return <primitive object={obj} scale={0.5} />;
}

function GlbModel({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

function BoxFallback() {
    return (
        <mesh>
            <boxGeometry />
            <meshStandardMaterial wireframe />
        </mesh>
    );
}

function LoadedModel({ model, showHelpers }: LoadedModelProps) {
    return (
        <Suspense fallback={<BoxFallback />}>
            <PivotControls anchor={[0, 0, 0]} depthTest={false} scale={0.75} visible={showHelpers}>
                {model.type === 'splat' && <Splat alphaTest={0.1} src={model.url} />}
                {model.type === 'fbx' && <FbxModel url={model.url} />}
                {model.type === 'obj' && <ObjModel url={model.url} />}
                {model.type === 'glb' && <GlbModel url={model.url} />}
            </PivotControls>
        </Suspense>
    );
}

export default Viewer;
