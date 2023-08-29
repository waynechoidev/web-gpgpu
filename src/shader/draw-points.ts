export const drawPointsVS = `#version 300 es
  in vec4 point;

  uniform float numPoints;
  uniform mat4 matrix;

  out vec4 v_color;

  vec3 hsv2rgb(vec3 c) {
    c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    gl_Position = matrix * point;
    gl_PointSize = 10.0;
 
    float hue = float(gl_VertexID) / numPoints;
    v_color = vec4(hsv2rgb(vec3(hue, 1, 1)), 1);
  }
  `;
