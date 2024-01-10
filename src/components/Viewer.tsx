import { useState } from "react";
import {
  Canvas,
  useLoader,
  Object3DNode,
  extend,
  MeshProps,
} from "@react-three/fiber";

import { Suspense } from "react";
//ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";

import { LumaSplatsThree, LumaSplatsSemantics } from "@lumaai/luma-web";
import Skybox from "./Skybox";

// Make LumaSplatsThree available to R3F
extend({ LumaSplats: LumaSplatsThree });

// For typeScript support:
declare module "@react-three/fiber" {
  interface ThreeElements {
    lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>;
  }
}

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
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

type ModelProps = {
  position: [number, number, number];
  rotation: [number, number, number];
};

function Model(props: ModelProps) {
  const result = useLoader(GLTFLoader, "/assets/duck_model.glb");
  // You don't need to check for the presence of the result, when we're here
  // the result is guaranteed to be present since useLoader suspends the component
  return <primitive {...props} object={result.scene} />;
}

const Viewer = ({ viewGS }: { viewGS: boolean }) => {
  return (
    <Canvas>
      <GizmoHelper
        alignment="bottom-right" // widget alignment within scene
        margin={[80, 80]} // widget margins (X, Y)
        renderPriority={1}
      >
        <GizmoViewport
          axisColors={["grey", "grey", "grey"]}
          labelColor="black"
        />
      </GizmoHelper>
      <Skybox type="HDRI" />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {!viewGS ? (
        <Suspense fallback={<Box position={[0, 0, 0]} />}>
          <Model position={[0, 0, 0]} rotation={[0, -3.14 / 2, 0]} />
        </Suspense>
      ) : (
        <>
          <lumaSplats
            semanticsMask={LumaSplatsSemantics.FOREGROUND}
            source="https://lumalabs.ai/capture/822bac8d-70d6-404e-aaae-f89f46672c67"
            position={[-3, 0, 0]}
            scale={1}
            rotation={[0, -3.14, 0]}
          />
        </>
      )}

      <OrbitControls />
    </Canvas>
  );
};

export default Viewer;
