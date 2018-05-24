precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform int u_numPhotos;
uniform sampler2D u_tex1;
uniform sampler2D u_tex2;
uniform sampler2D u_tex3;
uniform sampler2D u_tex4;

void main() {
  const float lineHalf = 3.;

  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1. - uv.y;

  if (u_numPhotos == 1) {
    gl_FragColor = texture2D(u_tex1, uv);
  } else if (u_numPhotos == 2) {
    if (abs(gl_FragCoord.x - u_mouse.x) < lineHalf) {
      gl_FragColor = vec4(1.);
    } else if (gl_FragCoord.x < u_mouse.x) {
      gl_FragColor = texture2D(u_tex1, uv);
    } else {
      gl_FragColor = texture2D(u_tex2, uv);
    }
  } else if (u_numPhotos == 3) {
    if ((abs(gl_FragCoord.x - u_mouse.x) < lineHalf &&
         u_mouse.y < gl_FragCoord.y) ||
        abs(gl_FragCoord.y - u_mouse.y) < lineHalf) {
      gl_FragColor = vec4(1.);
    } else if (gl_FragCoord.y < u_mouse.y){
      gl_FragColor = texture2D(u_tex3, uv);
    } else {
      if(gl_FragCoord.x < u_mouse.x) {
        gl_FragColor = texture2D(u_tex1, uv);
      } else {
        gl_FragColor = texture2D(u_tex2, uv);
      }
    }
  } else if (u_numPhotos == 4) {
    if (abs(gl_FragCoord.x - u_mouse.x) < lineHalf ||
        abs(gl_FragCoord.y - u_mouse.y) < lineHalf) {
      gl_FragColor = vec4(1.);
    } else if (gl_FragCoord.y > u_mouse.y) {
      if (gl_FragCoord.x < u_mouse.x) {
        // upper left
        gl_FragColor = texture2D(u_tex1, uv);
      } else {
        // upper right
        gl_FragColor = texture2D(u_tex2, uv);
      }
    } else {
      if (gl_FragCoord.x < u_mouse.x) {
        // lower left
        gl_FragColor = texture2D(u_tex3, uv);
      } else {
        // lower right
        gl_FragColor = texture2D(u_tex4, uv);
      }
    }
  } else {
    gl_FragColor = vec4(0., 0., 0., 1.);
  }
}
