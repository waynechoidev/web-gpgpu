import { Engine } from "./lib/engine";
import "./style.css";
import { ClosestLine } from "./program/closest-line";
import { createPoints, orthographic } from "./lib/utils";
import { DrawLines } from "./program/draw-lines";
import { DrawClosestLines } from "./program/draw-closest-line";
import { DrawPoints } from "./program/draw-points";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

function main() {
  const engine = new Engine(WIDTH, HEIGHT);
  const gl = engine.gl;

  const points = createPoints(8, [
    [0, gl.canvas.width],
    [0, gl.canvas.height],
  ]);
  const lines = createPoints(125 * 2, [
    [0, gl.canvas.width],
    [0, gl.canvas.height],
  ]);
  const numPoints = points.length / 2;
  const numLineSegments = lines.length / 2 / 2;

  const closestNdxBuffer = engine.makeBuffer(
    new Float32Array(numPoints),
    gl.STATIC_DRAW
  );
  const pointsBuffer = engine.makeBuffer(points, gl.STATIC_DRAW);

  const { tex: linesTex, dimensions: linesTexDimensions } =
    engine.createDataTexture(lines, 2, gl.RG32F, gl.RG, gl.FLOAT);

  const closestLinePrg = new ClosestLine(gl);
  const drawLinesPrg = new DrawLines(gl);
  const drawClosestLinesPrg = new DrawClosestLines(gl);
  const drawPointsPrg = new DrawPoints(gl);

  const closestLinesVA = engine.makeVertexArray([
    [pointsBuffer!, closestLinePrg.point],
  ]);

  const drawClosestLinesVA = gl.createVertexArray();
  gl.bindVertexArray(drawClosestLinesVA);
  gl.bindBuffer(gl.ARRAY_BUFFER, closestNdxBuffer);
  gl.enableVertexAttribArray(drawClosestLinesPrg.closestNdx);
  gl.vertexAttribIPointer(drawClosestLinesPrg.closestNdx, 1, gl.INT, 0, 0);
  gl.vertexAttribDivisor(drawClosestLinesPrg.closestNdx, 1);

  const drawPointsVA = engine.makeVertexArray([
    [pointsBuffer!, drawPointsPrg.point],
  ]);

  const closestNdxTF = engine.makeTransformFeedback(closestNdxBuffer!);

  function drawArraysWithTransformFeedback(
    tf: WebGLTransformFeedback,
    primitiveType: number,
    count: number
  ) {
    // turn of using the fragment shader
    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(primitiveType, 0, count);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    // turn on using fragment shaders again
    gl.disable(gl.RASTERIZER_DISCARD);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

  function computeClosestLines() {
    gl.bindVertexArray(closestLinesVA);
    closestLinePrg.use();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, linesTex);

    gl.uniform1i(closestLinePrg.linesTex, 0);
    gl.uniform1i(closestLinePrg.numLineSegments, numLineSegments);

    drawArraysWithTransformFeedback(closestNdxTF!, gl.POINTS, numPoints);
  }

  function drawAllLines(matrix: Float32Array) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.bindVertexArray(null);
    drawLinesPrg.use();

    // bind the lines texture to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, linesTex);

    // Tell the shader to use texture on texture unit 0
    gl.uniform1i(drawLinesPrg.linesTex, 0);
    gl.uniformMatrix4fv(drawLinesPrg.matrix, false, matrix);

    gl.drawArrays(gl.LINES, 0, numLineSegments * 2);
  }

  function drawClosestLines(matrix: Float32Array) {
    gl.bindVertexArray(drawClosestLinesVA);
    drawClosestLinesPrg.use();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, linesTex);

    gl.uniform1i(drawClosestLinesPrg.linesTex, 0);
    gl.uniform1f(drawClosestLinesPrg.numPoints, numPoints);
    gl.uniformMatrix4fv(drawClosestLinesPrg.matrix, false, matrix);

    gl.drawArraysInstanced(gl.LINES, 0, 2, numPoints);
  }

  function drawPoints(matrix: Float32Array) {
    gl.bindVertexArray(drawPointsVA);
    drawPointsPrg.use();

    gl.uniform1f(drawPointsPrg.numPoints, numPoints);
    gl.uniformMatrix4fv(drawPointsPrg.matrix, false, matrix);

    gl.drawArrays(gl.POINTS, 0, numPoints);
  }

  computeClosestLines();

  const matrix = orthographic(0, gl.canvas.width, 0, gl.canvas.height, -1, 1);

  drawClosestLines(matrix);
  drawAllLines(matrix);
  drawPoints(matrix);
}

main();
