export const drawClosestLinesVS = `#version 300 es
  in int closestNdx;
  uniform float numPoints;
  uniform sampler2D linesTex;
  uniform mat4 matrix;

  out vec4 v_color;

  vec4 getAs1D(sampler2D tex, ivec2 dimensions, int index) {
    int y = index / dimensions.x;
    int x = index % dimensions.x;
    return texelFetch(tex, ivec2(x, y), 0);
  }

  // converts hue, saturation, and value each in the 0 to 1 range
  // to rgb.  c = color, c.x = hue, c.y = saturation, c.z = value
  vec3 hsv2rgb(vec3 c) {
    c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    ivec2 linesTexDimensions = textureSize(linesTex, 0);

    // pull the position from the texture
    int linePointId = closestNdx * 2 + gl_VertexID % 2;
    vec4 position = getAs1D(linesTex, linesTexDimensions, linePointId);

    // do the common matrix math
    gl_Position = matrix * vec4(position.xy, 0, 1);

    int pointId = gl_InstanceID;
    float hue = float(pointId) / numPoints;
    v_color = vec4(hsv2rgb(vec3(hue, 1, 1)), 1);
  }
  `;
