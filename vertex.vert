precision mediump float;
attribute vec3 a_position;
uniform float time;
uniform vec2 resolution;
varying vec3 vpos;
void main(void) {
    gl_Position = vec4(a_position, 1.0);
    vpos=a_position;
    gl_PointSize = 10.0;
}