out vec3 oTexCoords;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    oTexCoords = position + vec3(0.5);
}
