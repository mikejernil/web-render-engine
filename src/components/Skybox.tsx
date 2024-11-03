import { extend, useLoader } from "@react-three/fiber";
import { BackSide, LinearFilter, MathUtils, ShaderLib, Vector3 } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Sky } from "three/examples/jsm/objects/Sky";

extend({ Sky });

const HDRISky = () => {
  const texture = useLoader(
    RGBELoader,
    "/assets/kloofendal_28d_misty_puresky_2k.hdr"
  );

  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  const shader = ShaderLib.equirect;

  return (
    <mesh>
      <boxGeometry args={[100, 100, 100]} />
      <shaderMaterial
        fragmentShader={shader.fragmentShader}
        vertexShader={shader.vertexShader}
        uniforms={shader.uniforms}
        uniforms-tEquirect-value={texture}
        depthWrite={false}
        side={BackSide}
      />
    </mesh>
  );
};

const ShaderSky = () => {
  const sun = new Vector3();
  const elevation = 90;
  const azimuth = -150;
  const phi = MathUtils.degToRad(90 - elevation);
  const theta = MathUtils.degToRad(azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  //@ts-expect-error undefined type error sky from drei
  return <sky />;
};

const Skybox = (props: { type: "SHADER" | "HDRI" }) => {
  return props.type == "SHADER" ? <ShaderSky /> : <HDRISky />;
};

export default Skybox;
