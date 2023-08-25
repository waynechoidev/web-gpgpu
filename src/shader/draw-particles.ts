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
  
   // Function to generate a random float between min and max
  float random(float min, float max, float seed) {
      return fract(sin(seed)) * (max - min) + min;
  }

  void main() {
    // Generate a random color for each particle
    vec3 randomColor = vec3(
      random(0.0, 0.5, gl_FragCoord.x),
      random(0.0, 0.5, gl_FragCoord.y),
      random(0.0, 0.5, 0.0)  // Seed doesn't need to be based on coordinates
    );

    outColor = vec4(randomColor, 1.0);
  }
  `;
