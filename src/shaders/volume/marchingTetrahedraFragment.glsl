in vec3 oNormal;

layout(location = 0) out vec4 FragColor;

void main() {
    // coloured by the surface normal, same look as the desktop engine
    FragColor = vec4(oNormal, 1.0);
}
