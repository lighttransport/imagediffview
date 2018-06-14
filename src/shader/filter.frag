precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform sampler2D u_tex1;
uniform int u_filterMode;
uniform float u_sepiaAmount;
uniform vec2 u_hueSaturation;
uniform vec2 u_brightnessContrast;
uniform float u_vibranceAmount;
uniform float u_scale;
uniform vec2 u_translate;
uniform int u_chartPickMode;
uniform vec4 u_chartFirstSecondPoints;
uniform vec2 u_chartThirdPoint;

const int FILTER_NONE = 0;
const int FILTER_SEPIA = 1;
const int FILTER_HUE_SATURATION = 2;
const int FILTER_BRIGHTNESS_CONTRAST = 3;
const int FILTER_VIBRANCE = 4;

// These codes are originally written by Evan Wallace
// https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/sepia.js
// amount: 0 to 1
vec3 sepia(vec3 c, float amount) {
    vec3 color;
    color.r = min(1.0, (c.r * (1.0 - (0.607 * amount))) + (c.g * (0.769 * amount)) + (c.b * (0.189 * amount)));
    color.g = min(1.0, (c.r * 0.349 * amount) + (c.g * (1.0 - (0.314 * amount))) + (c.b * 0.168 * amount));
    color.b = min(1.0, (c.r * 0.272 * amount) + (c.g * 0.534 * amount) + (c.b * (1.0 - (0.869 * amount))));
    return color;
}

// https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/huesaturation.js
// hue -1 to 1
// saturation -1 to 1
vec3 hueSaturation(vec3 color, float hue, float saturation) {
    float angle = hue * 3.14159265;
    float s = sin(angle), c = cos(angle);
    vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
    float len = length(color.rgb);
    color.rgb = vec3(
                     dot(color.rgb, weights.xyz),
                     dot(color.rgb, weights.zxy),
                     dot(color.rgb, weights.yzx)
                     );

    /* saturation adjustment */
    float average = (color.r + color.g + color.b) / 3.0;
    if (saturation > 0.0) {
        color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - saturation));
    } else {
        color.rgb += (average - color.rgb) * (-saturation);
    }
    return color;
}

// https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/brightnesscontrast.js
// brightness -1 to 1
// contrast -1 to 1
vec3 brightnessContrast(vec3 color, float brightness, float contrast) {
    color.rgb += brightness;
    if (contrast > 0.0) {
        color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;
    } else {
        color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;
    }
    return color;
}

// https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/vibrance.js
// amount -1 to 1
vec3 vibrance(vec3 color, float amount) {
    float average = (color.r + color.g + color.b) / 3.0;
    float mx = max(color.r, max(color.g, color.b));
    float amt = (mx - average) * (-amount * 3.0);
    color.rgb = mix(color.rgb, vec3(mx), amt);
    return color;
}


void main() {
    vec2 texCoord = gl_FragCoord.xy / u_resolution;
    texCoord.y = 1. - texCoord.y;
    texCoord -= vec2(0.5);
    texCoord *= u_scale;
    texCoord += vec2(0.5);
    texCoord += u_translate;

    if(texCoord.x > 1. || texCoord.x < 0. ||
       texCoord.y > 1. || texCoord.y < 0.) {
      gl_FragColor = vec4(1, 1, 1, 1);
      return;
    }

    vec2 firstPoint = u_chartFirstSecondPoints.xy;
    vec2 secondPoint = u_chartFirstSecondPoints.zw;
    vec2 thirdPoint = u_chartThirdPoint;
    if(u_chartPickMode >= 1) {
      if (distance(firstPoint, texCoord) < 0.001 ) {
        gl_FragColor = vec4(1, 1, 1, 1);
        return;
      }
    }
    if (u_chartPickMode >= 2) {
      if (distance(secondPoint, texCoord) < 0.001) {
        gl_FragColor = vec4(1, 1, 1, 1);
        return;
      }
    }
    if (u_chartPickMode >= 3) {
      if (distance(thirdPoint, texCoord) < 0.001) {
        gl_FragColor = vec4(1, 1, 1, 1);
        return;
      }
    }
    if (u_chartPickMode >= 3) {
      float d1 = secondPoint.x - firstPoint.x;
      float d2 = secondPoint.y - thirdPoint.y;
      float offsetX = abs(d1) / 12.0;
      float offsetY = abs(d2) / 8.0;
      float stepX = abs(d1) / 6.0;
      float stepY = abs(d2) / 4.0;
      for(int i = 0; i < 6; i++) {
        for(int j = 0; j < 4; j++) {
          float x = offsetX + stepX * float(i);
          float y = offsetY + stepY * float(j);
          if(distance(firstPoint + vec2(x, y), texCoord) < 0.001) {
            gl_FragColor = vec4(1, 1, 1, 1);
            return;
          }
        }
      }
    }

    vec4 color = texture2D(u_tex1, texCoord);

    if (u_filterMode == FILTER_SEPIA) {
        gl_FragColor = vec4(sepia(color.rgb, u_sepiaAmount), 1);
    } else if (u_filterMode == FILTER_HUE_SATURATION) {
        gl_FragColor = vec4(hueSaturation(color.rgb,
                                          u_hueSaturation.x,
                                          u_hueSaturation.y), 1);

    } else if (u_filterMode == FILTER_BRIGHTNESS_CONTRAST) {
        gl_FragColor = vec4(brightnessContrast(color.rgb,
                                               u_brightnessContrast.x,
                                               u_brightnessContrast.y), 1);
    } else if (u_filterMode == FILTER_VIBRANCE) {
        gl_FragColor = vec4(vibrance(color.rgb, u_vibranceAmount), 1);
    } else {
        gl_FragColor = color;
    }
}
