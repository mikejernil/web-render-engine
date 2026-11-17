precision highp float;
precision highp sampler3D;

in vec3 oTexCoords;

uniform sampler3D uVolumeTexture;
uniform vec3 u_cameraPosition;
uniform vec3 u_stepSize;
uniform vec3 u_clipMin;
uniform vec3 u_clipMax;
uniform float u_densityThreshold;
uniform float u_opacity;
uniform int u_colorMap;

const int MAX_SAMPLES = 300;
const vec3 texMin = vec3(0.0);
const vec3 texMax = vec3(1.0);

layout(location = 0) out vec4 FragColor;

vec3 getTransferColor(float value, int mode) {
    float t = clamp(value, 0.0, 1.0);

    // 0: Anatomical
    if (mode == 0) {
        vec3 tissue = vec3(0.55, 0.14, 0.12);
        vec3 muscle = vec3(0.88, 0.52, 0.35);
        vec3 bone = vec3(0.98, 0.95, 0.88);
        return t < 0.45
            ? mix(tissue, muscle, t / 0.45)
            : mix(muscle, bone, (t - 0.45) / 0.55);
    }

    // 1: Viridis
    if (mode == 1) {
        vec3 c0 = vec3(0.267, 0.004, 0.329);
        vec3 c1 = vec3(0.190, 0.407, 0.556);
        vec3 c2 = vec3(0.208, 0.718, 0.472);
        vec3 c3 = vec3(0.993, 0.906, 0.144);
        if (t < 0.33) return mix(c0, c1, t / 0.33);
        if (t < 0.66) return mix(c1, c2, (t - 0.33) / 0.33);
        return mix(c2, c3, (t - 0.66) / 0.34);
    }

    // 2: Thermal
    if (mode == 2) {
        vec3 cold = vec3(0.10, 0.02, 0.25);
        vec3 mid = vec3(0.85, 0.15, 0.10);
        vec3 hot = vec3(1.00, 0.92, 0.40);
        return t < 0.5
            ? mix(cold, mid, t * 2.0)
            : mix(mid, hot, (t - 0.5) * 2.0);
    }

    // 3: Grayscale
    return vec3(t);
}

void main() {
    FragColor = vec4(0.0);
    vec3 dataPosition = oTexCoords;
    vec3 geometryDirection = normalize((oTexCoords - vec3(0.5)) - u_cameraPosition);
    vec3 directionStep = geometryDirection * u_stepSize;

    for (int i = 0; i < MAX_SAMPLES; i++) {
        dataPosition += directionStep;
        bool bStop = dot(sign(dataPosition - texMin), sign(texMax - dataPosition)) < 3.0;
        if (bStop) break;

        bool isClipped = dot(sign(dataPosition - u_clipMin), sign(u_clipMax - dataPosition)) < 3.0;
        if (isClipped) continue;

        float fSample = texture(uVolumeTexture, dataPosition).r;
        if (fSample < u_densityThreshold) continue;

        float sampleAlpha = clamp(fSample * u_opacity, 0.0, 1.0);
        float weight = sampleAlpha * (1.0 - FragColor.a);
        vec3 sampleColor = getTransferColor(fSample, u_colorMap);

        FragColor.rgb += weight * sampleColor;
        FragColor.a += weight;

        if (FragColor.a > 0.99) break;
    }
}