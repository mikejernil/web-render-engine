precision highp float;
precision highp sampler3D;

in vec3 oTexCoords;

uniform sampler3D uVolumeTexture;
uniform vec3 u_cameraPosition;
uniform vec3 u_stepSize;
uniform vec3 u_clipMin;
uniform vec3 u_clipMax;

const int MAX_SAMPLES = 300;
const vec3 texMin = vec3(0.0);
const vec3 texMax = vec3(1.0);

layout(location = 0) out vec4 FragColor;

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
        float prev_alpha = fSample - (fSample * FragColor.a);
        FragColor.rgb += prev_alpha * vec3(fSample);
        FragColor.a += prev_alpha;

        if (FragColor.a > 0.99) break;
    }
}