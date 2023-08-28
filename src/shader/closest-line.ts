export const closestLineVS = `#version 300 es
  in vec3 point;

  uniform sampler2D linesTex;
  uniform int numLineSegments;

  flat out int closestNdx;

  vec4 getAs1D(sampler2D tex, ivec2 dimensions, int index) {
    int y = index / dimensions.x;
    int x = index % dimensions.x;
    return texelFetch(tex, ivec2(x, y), 0);
  }

  // from https://stackoverflow.com/a/6853926/128511
  // a is the point, b,c is the line segment
  float distanceFromPointToLine(in vec3 a, in vec3 b, in vec3 c) {
    vec3 ba = a - b;
    vec3 bc = c - b;
    float d = dot(ba, bc);
    float len = length(bc);
    float param = 0.0;
    if (len != 0.0) {
      param = clamp(d / (len * len), 0.0, 1.0);
    }
    vec3 r = b + bc * param;
    return distance(a, r);
  }

  void main() {
    ivec2 linesTexDimensions = textureSize(linesTex, 0);
    
    // find the closest line segment
    float minDist = 10000000.0; 
    int minIndex = -1;
    for (int i = 0; i < numLineSegments; ++i) {
      vec3 lineStart = getAs1D(linesTex, linesTexDimensions, i * 2).xyz;
      vec3 lineEnd = getAs1D(linesTex, linesTexDimensions, i * 2 + 1).xyz;
      float dist = distanceFromPointToLine(point, lineStart, lineEnd);
      if (dist < minDist) {
        minDist = dist;
        minIndex = i;
      }
    }
    
    closestNdx = minIndex;
  }
  `;

export const closestLineFS = `#version 300 es
precision highp float;
void main() {
}
`;
