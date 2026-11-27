
precision highp float;
precision highp sampler3D;

in vec3 oTexCoords;

uniform sampler3D uVolumeTexture;

layout(location = 0) out vec4 FragColor;
void main()
{
    FragColor = texture(uVolumeTexture,oTexCoords).rrrr;
}

