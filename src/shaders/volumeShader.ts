export const VOLUME_VERTEX_SHADER = `
out vec3 vPosition;

void main() {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const VOLUME_FRAGMENT_SHADER = `
precision highp float;
precision highp sampler3D;

in vec3 vPosition;
out vec4 fragColor;

uniform sampler3D uVolumeTexture;
uniform vec3 uCameraPosition;

uniform float uXMinusSideFace;
uniform float uXPlusSideFace;
uniform float uYMinusBottomFace;
uniform float uYPlusTopFace;
uniform float uZMinusBackFace;
uniform float uZPlusFrontFace;

uniform float uDensityThreshold;
uniform float uOpacity;
uniform int uColorPreset;

vec3 getColorFromPreset(float density) {
  if (uColorPreset == 0) {
    return mix(vec3(0.2, 0.05, 0.3), vec3(1.0, 0.85, 0.65), density);
  }
  if (uColorPreset == 1) {
    return mix(vec3(0.25, 0.0, 0.35), vec3(0.1, 0.9, 0.5), density);
  }
  if (uColorPreset == 2) {
    return vec3(density * 2.0, density * 1.2 - 0.2, density - 0.5);
  }
  return vec3(density);
}

bool isInsideClippingBox(vec3 point) {
  return (
    point.x >= uXMinusSideFace && point.x <= uXPlusSideFace &&
    point.y >= uYMinusBottomFace && point.y <= uYPlusTopFace &&
    point.z >= uZMinusBackFace && point.z <= uZPlusFrontFace
  );
}

void main() {
  vec3 rayDirection = normalize(vPosition - uCameraPosition);
  int totalSteps = 128;
  float stepSize = 3.5 / float(totalSteps);

  vec3 currentPoint = vPosition - rayDirection * 3.5;
  vec4 accumulatedColor = vec4(0.0);

  for (int step = 0; step < 128; step++) {
    if (isInsideClippingBox(currentPoint)) {
      vec3 textureCoord = (currentPoint + 1.0) * 0.5;
      float density = texture(uVolumeTexture, textureCoord).r;

      if (density > uDensityThreshold) {
        vec3 sampleColor = getColorFromPreset(density);
        float sampleAlpha = (density - uDensityThreshold) * uOpacity * 0.08;

        accumulatedColor.rgb += (1.0 - accumulatedColor.a) * sampleColor * sampleAlpha;
        accumulatedColor.a += (1.0 - accumulatedColor.a) * sampleAlpha;

        if (accumulatedColor.a >= 0.95) {
          break;
        }
      }
    }

    currentPoint += rayDirection * stepSize;
  }

  if (accumulatedColor.a <= 0.01) {
    discard;
  }

  fragColor = accumulatedColor;
}
`;
