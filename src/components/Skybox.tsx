import { useMemo } from 'react';

import {
    BackSide,
    EquirectangularReflectionMapping,
    LinearFilter,
    MathUtils,
    ShaderLib,
    Vector3,
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { Sky } from 'three/examples/jsm/objects/Sky';

import { extend, useLoader } from '@react-three/fiber';

extend({ Sky });

const SHARED_HDRI_PATH = '/assets/kloofendal_28d_misty_puresky_2k.hdr';

const HDRISky = () => {
    const texture = useLoader(RGBELoader, SHARED_HDRI_PATH);

    // Configure texture filtering once loaded
    useMemo(() => {
        texture.mapping = EquirectangularReflectionMapping;
        texture.magFilter = LinearFilter;
        texture.minFilter = LinearFilter;
        texture.needsUpdate = true;
    }, [texture]);

    const shader = ShaderLib.equirect;

    // Clone equirect uniforms so global ShaderLib state is not mutated
    const uniforms = useMemo(
        () => ({
            ...shader.uniforms,
            tEquirect: { value: texture },
        }),
        [shader.uniforms, texture],
    );

    return (
        <mesh>
            <boxGeometry args={[100, 100, 100]} />
            <shaderMaterial
                fragmentShader={shader.fragmentShader}
                vertexShader={shader.vertexShader}
                uniforms={uniforms}
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

const Skybox = (props: { type: 'SHADER' | 'HDRI' }) => {
    return props.type === 'SHADER' ? <ShaderSky /> : <HDRISky />;
};

export default Skybox;
