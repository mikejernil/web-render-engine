precision highp float;

in vec3 oNormal;

layout(location = 0) out vec4 FragColor;

void main() {
    // the surface is coloured by its normal, same look as the desktop engine
    FragColor = vec4(oNormal, 1.0);
}
