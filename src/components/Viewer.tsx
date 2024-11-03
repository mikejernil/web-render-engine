import { Suspense, useState } from 'react';

//ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import {
    GizmoHelper,
    GizmoViewport,
    Grid,
    OrbitControls,
    Splat,
    TransformControls,
} from '@react-three/drei';
import { Canvas, MeshProps, useLoader } from '@react-three/fiber';

import Skybox from './Skybox';

function Box(props: MeshProps) {
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false);
    const [active, setActive] = useState(false);

    // Return view, these are regular three.js elements expressed in JSX
    return (
        <mesh
            {...props}
            scale={active ? 1.5 : 1}
            onClick={() => setActive(!active)}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    );
}

type ModelProps = {
    position: [number, number, number];
    rotation: [number, number, number];
};

function Model(props: ModelProps) {
    const result = useLoader(GLTFLoader, '/assets/duck_model.glb');
    // You don't need to check for the presence of the result, when we're here
    // the result is guaranteed to be present since useLoader suspends the component
    return <primitive {...props} object={result.scene} />;
}

const Viewer = ({ viewGS, url, load }: { viewGS: boolean; url: string; load: boolean }) => {
    return (
        <Canvas>
            <GizmoHelper
                alignment="bottom-right" // widget alignment within scene
                margin={[80, 80]} // widget margins (X, Y)
                renderPriority={1}
            >
                <GizmoViewport axisColors={['#8ca6db', '#8ca6db', '#8ca6db']} labelColor="black" />
            </GizmoHelper>
            <Grid infiniteGrid fadeDistance={25} sectionColor={'darkgrey'} />
            <Skybox type="HDRI" />
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            {!viewGS && (
                <Suspense fallback={<Box position={[0, 0, 0]} />}>
                    <TransformControls mode="translate">
                        <Model position={[0, 0, 0]} rotation={[0, -3.14 / 2, 0]} />
                    </TransformControls>
                </Suspense>
            )}
            {viewGS && load && url && (
                <Suspense fallback={<Box position={[0, 0, 0]} />}>
                    <TransformControls mode="translate">
                        <Splat alphaTest={0.1} position={[0, 0, 0]} src={url} />
                    </TransformControls>
                </Suspense>
            )}
            <OrbitControls makeDefault />
        </Canvas>
    );
};

export default Viewer;
