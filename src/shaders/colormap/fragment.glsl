

precision highp float;
precision highp sampler3D;

in vec3 oTexCoords;

uniform sampler3D uVolumeTexture;
uniform sampler2D u_LevelOfDetail;

layout(location = 0) out vec4 FragColor;
void main()
{
    float fIntensity = texture(uVolumeTexture,oTexCoords).r;
    FragColor = texture(u_LevelOfDetail,vec2(fIntensity,0.5));
}

