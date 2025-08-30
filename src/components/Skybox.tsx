import { useEffect, useMemo, useRef } from 'react';

import {
    BackSide,
    EquirectangularReflectionMapping,
    FloatType,
    LinearFilter,
    MathUtils,
    ShaderLib,
    Vector3,
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { Sky as SkyImpl } from 'three/examples/jsm/objects/Sky';

import { extend, useLoader } from '@react-three/fiber';

import { useTheme } from '../context/ThemeContext';

extend({ Sky: SkyImpl });

const HDRISky = () => {
    const { theme } = useTheme();
    const hdrFile =
        theme === 'dark' ? 'starry_night_sky_dome_2k' : 'kloofendal_28d_misty_puresky_2k';
    const hdrPath = `/assets/${hdrFile}.hdr`;

    const texture = useLoader(RGBELoader, hdrPath, (loader) => loader.setDataType(FloatType));

    useMemo(() => {
        if (texture) {
            texture.mapping = EquirectangularReflectionMapping;
            texture.minFilter = LinearFilter;
            texture.magFilter = LinearFilter;
            texture.needsUpdate = true;
        }
    }, [texture]);

    const shader = ShaderLib.equirect;
    const uniforms = useMemo(() => {
        if (!texture) return undefined;
        const clonedUniforms = { ...shader.uniforms };
        clonedUniforms['tEquirect'] = { value: texture };
        return clonedUniforms;
    }, [shader.uniforms, texture]);

    const meshScale = useMemo(() => new Vector3(100, 100, 100), []);

    return uniforms ? (
        <mesh scale={meshScale}>
            <boxGeometry args={[1, 1, 1]} />
            <shaderMaterial
                key={hdrPath}
                fragmentShader={shader.fragmentShader}
                vertexShader={shader.vertexShader}
                uniforms={uniforms}
                depthWrite={false}
                side={BackSide}
            />
        </mesh>
    ) : null;
};

const ShaderSky = () => {
    const { theme } = useTheme();
    const skyRef = useRef<SkyImpl>(null!);

    const { sunPosition, skyParams } = useMemo(() => {
        const params = {
            turbidity: theme === 'dark' ? 100 : 10,
            rayleigh: theme === 'dark' ? 10 : 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: theme === 'dark' ? -10 : 10,
            azimuth: 180,
        };
        const sun = new Vector3();
        const phi = MathUtils.degToRad(90 - params.elevation);
        const theta = MathUtils.degToRad(params.azimuth);
        sun.setFromSphericalCoords(1, phi, theta);
        return { sunPosition: sun, skyParams: params };
    }, [theme]);

    useEffect(() => {
        const sky = skyRef.current;
        if (sky) {
            const uniforms = sky.material.uniforms;
            uniforms['turbidity'].value = skyParams.turbidity;
            uniforms['rayleigh'].value = skyParams.rayleigh;
            uniforms['mieCoefficient'].value = skyParams.mieCoefficient;
            uniforms['mieDirectionalG'].value = skyParams.mieDirectionalG;
            uniforms['sunPosition'].value.copy(sunPosition);
        }
    }, [skyParams, sunPosition]);

    return <sky ref={skyRef} scale={new Vector3(1000, 1000, 1000)} />;
};

const Skybox = (props: { type: 'SHADER' | 'HDRI' }) => {
    return props.type === 'SHADER' ? <ShaderSky /> : <HDRISky />;
};

export default Skybox;
