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
uniform int u_colorPreset;

const int MAX_SAMPLES = 300;
const vec3 texMin = vec3(0.0);
const vec3 texMax = vec3(1.0);

layout(location = 0) out vec4 FragColor;

vec3 getColorFromPreset(float density) {
    if (u_colorPreset == 0) {
        return mix(vec3(0.2, 0.05, 0.3), vec3(1.0, 0.85, 0.65), density);
    }
    if (u_colorPreset == 1) {
        return mix(vec3(0.25, 0.0, 0.35), vec3(0.1, 0.9, 0.5), density);
    }
    if (u_colorPreset == 2) {
        return vec3(density * 2.0, density * 1.2 - 0.2, density - 0.5);
    }
    return vec3(density);
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
        if (fSample <= u_densityThreshold) continue;

        vec3 sampleColor = getColorFromPreset(fSample);
        float prev_alpha = (fSample - (fSample * FragColor.a)) * u_opacity;
        FragColor.rgb += prev_alpha * sampleColor;
        FragColor.a += prev_alpha;

        if (FragColor.a > 0.99) break;
    }
}