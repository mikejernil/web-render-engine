import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DIMENSION = 256;
const VOXEL_COUNT = DIMENSION * DIMENSION * DIMENSION;

const vertexShader = `
    out vec3 oTexCoords;
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        oTexCoords = position + vec3(0.5);
    }
`;

const fragmentShader = `
    precision highp float;
    precision highp sampler3D;

    in vec3 oTexCoords;

    uniform sampler3D uVolumeTexture;
    uniform vec3 u_cameraPosition;
    uniform vec3 u_stepSize;

    const int MAX_SAMPLES = 300;
    const vec3 texMin = vec3(0.0);
    const vec3 texMax = vec3(1.0);

    layout(location = 0) out vec4 FragColor;

    void main() {
        // Kept as in the original renderer. Its output initialization is commented out.
        // FragColor = vec4(0.0);

        vec3 dataPosition = oTexCoords;
        vec3 geometryDirection = normalize((oTexCoords - vec3(0.5)) - u_cameraPosition);
        vec3 directionStep = geometryDirection * u_stepSize;

        for (int i = 0; i < MAX_SAMPLES; i++) {
            dataPosition += directionStep;

            bool bStop = dot(sign(dataPosition - texMin), sign(texMax - dataPosition)) < 3.0;
            if (bStop) break;

            float fSample = texture(uVolumeTexture, dataPosition).r;
            float prev_alpha = fSample * (1.0 - FragColor.a);

            FragColor.rgb += prev_alpha * vec3(fSample);
            FragColor.a += prev_alpha;

            if (FragColor.a > 0.99) break;
        }
    }
`;

export interface RawVolumeRendererProps {
  /** Raw, one-byte-per-voxel data for the existing 256³ volume format. */
  volumeData: Uint8Array | null;
}

/**
 * R3F-compatible wrapper for the existing raw-volume shader.
 * Render this inside an existing <Canvas>; it does not create a Canvas,
 * renderer, camera, controls, lights, or a render loop.
 */
export function RawVolumeRenderer({ volumeData }: RawVolumeRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const cameraPosition = useMemo(() => new THREE.Vector3(), []);

  const texture = useMemo(() => {
    if (!volumeData) return null;

    // Preserve the original loader's behavior: copy into a fixed 256³ buffer,
    // truncating excess bytes and leaving missing bytes as zeroes.
    const data = new Uint8Array(VOXEL_COUNT);
    data.set(volumeData.subarray(0, VOXEL_COUNT));

    const result = new THREE.Data3DTexture(data, DIMENSION, DIMENSION, DIMENSION);
    result.format = THREE.RedFormat;
    result.type = THREE.UnsignedByteType;
    result.minFilter = THREE.LinearFilter;
    result.magFilter = THREE.LinearFilter;
    result.wrapS = THREE.ClampToEdgeWrapping;
    result.wrapT = THREE.ClampToEdgeWrapping;
    result.wrapR = THREE.ClampToEdgeWrapping;
    result.needsUpdate = true;

    return result;
  }, [volumeData]);

  const uniforms = useMemo(
    () => ({
      uVolumeTexture: { value: null as THREE.Data3DTexture | null },
      u_cameraPosition: { value: new THREE.Vector3() },
      u_stepSize: {
        value: new THREE.Vector3(
          1.0 / DIMENSION,
          1.0 / DIMENSION,
          1.0 / DIMENSION,
        ),
      },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uVolumeTexture.value = texture;
    return () => texture?.dispose();
  }, [texture, uniforms]);

  useFrame(({ camera }) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    camera.getWorldPosition(cameraPosition);
    mesh.worldToLocal(cameraPosition);
    material.uniforms.u_cameraPosition.value.copy(cameraPosition);
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        glslVersion={THREE.GLSL3}
        transparent
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
