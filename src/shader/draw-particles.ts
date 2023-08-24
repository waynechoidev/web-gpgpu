export const drawParticlesVS = `#version 300 es
  in vec4 position;
  uniform mat4 matrix;

  void main() {
    // do the common matrix math
    gl_Position = matrix * position;
    gl_PointSize = 2.0;
  }
  `;

export const drawParticlesFS = `#version 300 es
  precision highp float;
  out vec4 outColor;
  void main() {
    outColor = vec4(1, 0, 0, 1);
  }
  `;
