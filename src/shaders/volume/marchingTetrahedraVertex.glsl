out vec3 oNormal;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    oNormal = normal;
}
