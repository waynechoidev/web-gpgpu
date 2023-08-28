import { Engine } from "./lib/engine";
import "./style.css";
import { createPoints, orthographic, swapBuffers } from "./lib/utils";
import { ClosestLine } from "./program/closest-line";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const points = new Float32Array([100, 100, 200, 100]);
const lines = new Float32Array([
  25, 50, 25, 150, 90, 50, 90, 150, 125, 50, 125, 150, 185, 50, 185, 150, 225,
  50, 225, 150,
]);
const numPoints = points.length / 2;
const numLineSegments = lines.length / 2 / 2;

function main() {
  const engine = new Engine(WIDTH, HEIGHT);
  const gl = engine.gl;

  const closestNdxBuffer = engine.makeBuffer(
    new Float32Array(numPoints),
    gl.STATIC_DRAW
  );
  const pointsBuffer = engine.makeBuffer(points, gl.DYNAMIC_DRAW);

  // const { tex: linesTex, dimensions: linesTexDimensions } =
  engine.createDataTexture(lines, 2, gl.RG32F, gl.RG, gl.FLOAT);

  const closestLinePrg = new ClosestLine(gl);

  const closestLinesVA = engine.makeVertexArray([
    [pointsBuffer!, closestLinePrg.point],
  ]);

  const closestNdxTF = engine.makeTransformFeedback(closestNdxBuffer!);

  // compute the closest lines
  gl.bindVertexArray(closestLinesVA);
  closestLinePrg.use();
  gl.uniform1i(closestLinePrg.linesTex, 0);
  gl.uniform1i(closestLinePrg.numLineSegments, numLineSegments);

  // turn of using the fragment shader
  gl.enable(gl.RASTERIZER_DISCARD);

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, closestNdxTF);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, numPoints);
  gl.endTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  // turn on using fragment shaders again
  gl.disable(gl.RASTERIZER_DISCARD);

  {
    const results = new Int32Array(numPoints);
    gl.bindBuffer(gl.ARRAY_BUFFER, closestNdxBuffer);
    gl.getBufferSubData(gl.ARRAY_BUFFER, 0, results);
    log(results);
  }
}

main();

function log(results: Int32Array) {
  const elem = document.createElement("pre");
  elem.textContent = results.join(" ");
  document.body.appendChild(elem);
}
