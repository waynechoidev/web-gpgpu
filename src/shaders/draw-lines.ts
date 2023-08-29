export const drawLinesVS = `#version 300 es
  uniform sampler2D linesTex;
  uniform mat4 matrix;

  out vec4 v_color;

  vec4 getAs1D(sampler2D tex, ivec2 dimensions, int index) {
    int y = index / dimensions.x;
    int x = index % dimensions.x;
    return texelFetch(tex, ivec2(x, y), 0);
  }

  void main() {
    ivec2 linesTexDimensions = textureSize(linesTex, 0);
 
    // pull the position from the texture
    vec4 position = getAs1D(linesTex, linesTexDimensions, gl_VertexID);

    // do the common matrix math
    gl_Position = matrix * vec4(position.xy, 0, 1);

    // just so we can use the same fragment shader
    v_color = vec4(0.8, 0.8, 0.8, 1);
  }
  `;
