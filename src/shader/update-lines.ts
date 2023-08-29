export const updateLinesVS = `#version 300 es
  in vec4 position;
  void main() {
    gl_Position = position;
  }
  `;

export const updateLinesFS = `#version 300 es
  precision highp float;

  uniform sampler2D linesTex;
  uniform sampler2D velocityTex;
  uniform vec2 canvasDimensions;
  uniform float deltaTime;

  out vec4 outColor;

  vec2 euclideanModulo(vec2 n, vec2 m) {
  	return mod(mod(n, m) + m, m);
  }

  void main() {
    // compute texel coord from gl_FragCoord;
    ivec2 texelCoord = ivec2(gl_FragCoord.xy);
    
    vec2 position = texelFetch(linesTex, texelCoord, 0).xy;
    vec2 velocity = texelFetch(velocityTex, texelCoord, 0).xy;
    vec2 newPosition = euclideanModulo(position + velocity * deltaTime, canvasDimensions);

    outColor = vec4(newPosition, 0, 1);
  }
  `;
