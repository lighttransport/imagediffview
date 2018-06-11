precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform sampler2D u_tex1;
int filterMode = -1;

const int FILTER_NONE = -1;

void main() {
    vec2 texCoord = gl_FragCoord.xy / u_resolution;
    vec4 color = texture2D(u_tex1, texCoord);
    if(filterMode == FILTER_NONE) {
        gl_FragColor = color;
    } else {
        gl_FragColor = vec4(1, 0, 0, 1);
    }
}
