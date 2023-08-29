import { Engine } from "./lib/engine";
import "./style.css";
import { ClosestLine } from "./program/closest-line";
import { createPoints, orthographic } from "./lib/utils";
import { DrawLines } from "./program/draw-lines";
import { DrawClosestLines } from "./program/draw-closest-line";
import { DrawPoints } from "./program/draw-points";
import { UpdatePosition } from "./program/update-position";
import { UpdateLines } from "./program/update-lines";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

function main() {
  const engine = new Engine(WIDTH, HEIGHT);
  const gl = engine.gl;

  const ext = gl.getExtension("EXT_color_buffer_float");
  if (!ext) {
    alert("need EXT_color_buffer_float");
    return;
  }

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

  const pointVelocities = createPoints(numPoints, [
    [-20, 20],
    [-20, 20],
  ]);
  const lineVelocities = createPoints(numLineSegments * 2, [
    [-20, 20],
    [-20, 20],
  ]);

  const closestNdxBuffer = engine.makeBuffer(
    new Float32Array(numPoints),
    gl.STATIC_DRAW
  );
  const pointsBuffer1 = engine.makeBuffer(points, gl.DYNAMIC_DRAW);
  const pointsBuffer2 = engine.makeBuffer(points, gl.DYNAMIC_DRAW);
  const pointVelocitiesBuffer = engine.makeBuffer(
    pointVelocities,
    gl.STATIC_DRAW
  );
  const quadBuffer = engine.makeBuffer(
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const { tex: linesTex1, dimensions: linesTexDimensions1 } =
    engine.createDataTexture(lines, 2, gl.RG32F, gl.RG, gl.FLOAT);
  const { tex: linesTex2, dimensions: linesTexDimensions2 } =
    engine.createDataTexture(lines, 2, gl.RG32F, gl.RG, gl.FLOAT);
  const { tex: lineVelocitiesTex, dimensions: lineVelocitiesTexDimensions } =
    engine.createDataTexture(lineVelocities, 2, gl.RG32F, gl.RG, gl.FLOAT);

  const updatePositionPrg = new UpdatePosition(gl);
  const updateLinesPrg = new UpdateLines(gl);
  const closestLinePrg = new ClosestLine(gl);
  const drawLinesPrg = new DrawLines(gl);
  const drawClosestLinesPrg = new DrawClosestLines(gl);
  const drawPointsPrg = new DrawPoints(gl);

  const updatePositionVA1 = engine.makeVertexArray([
    [pointsBuffer1!, updatePositionPrg.oldPosition],
    [pointVelocitiesBuffer!, updatePositionPrg.velocity],
  ]);
  const updatePositionVA2 = engine.makeVertexArray([
    [pointsBuffer2!, updatePositionPrg.oldPosition],
    [pointVelocitiesBuffer!, updatePositionPrg.velocity],
  ]);

  const updateLinesVA = engine.makeVertexArray([
    [quadBuffer!, updateLinesPrg.position],
  ]);

  const closestLinesVA1 = engine.makeVertexArray([
    [pointsBuffer1!, closestLinePrg.point],
  ]);
  const closestLinesVA2 = engine.makeVertexArray([
    [pointsBuffer2!, closestLinePrg.point],
  ]);

  const drawClosestLinesVA = gl.createVertexArray();
  gl.bindVertexArray(drawClosestLinesVA);
  gl.bindBuffer(gl.ARRAY_BUFFER, closestNdxBuffer);
  gl.enableVertexAttribArray(drawClosestLinesPrg.closestNdx);
  gl.vertexAttribIPointer(drawClosestLinesPrg.closestNdx, 1, gl.INT, 0, 0);
  gl.vertexAttribDivisor(drawClosestLinesPrg.closestNdx, 1);

  const drawPointsVA1 = engine.makeVertexArray([
    [pointsBuffer1!, drawPointsPrg.point],
  ]);
  const drawPointsVA2 = engine.makeVertexArray([
    [pointsBuffer2!, drawPointsPrg.point],
  ]);

  const pointsTF1 = engine.makeTransformFeedback(pointsBuffer1!);
  const pointsTF2 = engine.makeTransformFeedback(pointsBuffer2!);

  const closestNdxTF = engine.makeTransformFeedback(closestNdxBuffer!);

  const linesFB1 = engine.createFramebuffer(linesTex1!);
  const linesFB2 = engine.createFramebuffer(linesTex2!);

  let current = {
    // for updating points
    updatePositionVA: updatePositionVA1, // read from points1
    pointsTF: pointsTF2, // write to points2
    // for updating line endings
    linesTex: linesTex1, // read from linesTex1
    linesFB: linesFB2, // write to linesTex2
    // for computing closest lines
    closestLinesVA: closestLinesVA2, // read from points2
    // for drawing all lines and closest lines
    allLinesTex: linesTex2, // read from linesTex2
    // for drawing points
    drawPointsVA: drawPointsVA2, // read form points2
  };

  let next = {
    // for updating points
    updatePositionVA: updatePositionVA2, // read from points2
    pointsTF: pointsTF1, // write to points1
    // for updating line endings
    linesTex: linesTex2, // read from linesTex2
    linesFB: linesFB1, // write to linesTex1
    // for computing closest lines
    closestLinesVA: closestLinesVA1, // read from points1
    // for drawing all lines and closest lines
    allLinesTex: linesTex1, // read from linesTex1
    // for drawing points
    drawPointsVA: drawPointsVA1, // read form points1
  };

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

  function updatePointPositions(deltaTime: number) {
    gl.bindVertexArray(current.updatePositionVA);
    updatePositionPrg.use();
    gl.uniform1f(updatePositionPrg.deltaTime, deltaTime);
    gl.uniform2f(
      updatePositionPrg.canvasDimensions,
      gl.canvas.width,
      gl.canvas.height
    );
    engine.drawArraysWithTransformFeedback(
      current.pointsTF!,
      gl.POINTS,
      numPoints
    );
  }

  function updateLineEndPoints(deltaTime: number) {
    // Update the line endpoint positions ---------------------
    gl.bindVertexArray(updateLinesVA); // just a quad
    updateLinesPrg.use();

    // bind texture to texture units 0 and 1
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, current.linesTex);
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, lineVelocitiesTex);

    // tell the shader to look at the textures on texture units 0 and 1
    gl.uniform1i(updateLinesPrg.linesTex, 0);
    gl.uniform1i(updateLinesPrg.velocityTex, 1);
    gl.uniform1f(updateLinesPrg.deltaTime, deltaTime);
    gl.uniform2f(
      updateLinesPrg.canvasDimensions,
      gl.canvas.width,
      gl.canvas.height
    );

    // write to the other lines texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, current.linesFB);
    gl.viewport(
      0,
      0,
      lineVelocitiesTexDimensions[0],
      lineVelocitiesTexDimensions[1]
    );

    // drawing a clip space -1 to +1 quad = map over entire destination array
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function computeClosestLines() {
    gl.bindVertexArray(current.closestLinesVA);
    closestLinePrg.use();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, current.linesTex);

    gl.uniform1i(closestLinePrg.linesTex, 0);
    gl.uniform1i(closestLinePrg.numLineSegments, numLineSegments);

    engine.drawArraysWithTransformFeedback(closestNdxTF!, gl.POINTS, numPoints);
  }

  function drawAllLines(matrix: Float32Array) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.bindVertexArray(null);
    drawLinesPrg.use();

    // bind the lines texture to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, current.allLinesTex);

    // Tell the shader to use texture on texture unit 0
    gl.uniform1i(drawLinesPrg.linesTex, 0);
    gl.uniformMatrix4fv(drawLinesPrg.matrix, false, matrix);

    gl.drawArrays(gl.LINES, 0, numLineSegments * 2);
  }

  function drawClosestLines(matrix: Float32Array) {
    gl.bindVertexArray(drawClosestLinesVA);
    drawClosestLinesPrg.use();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, current.allLinesTex);

    gl.uniform1i(drawClosestLinesPrg.linesTex, 0);
    gl.uniform1f(drawClosestLinesPrg.numPoints, numPoints);
    gl.uniformMatrix4fv(drawClosestLinesPrg.matrix, false, matrix);

    gl.drawArraysInstanced(gl.LINES, 0, 2, numPoints);
  }

  function drawPoints(matrix: Float32Array) {
    gl.bindVertexArray(current.drawPointsVA);
    drawPointsPrg.use();

    gl.uniform1f(drawPointsPrg.numPoints, numPoints);
    gl.uniformMatrix4fv(drawPointsPrg.matrix, false, matrix);

    gl.drawArrays(gl.POINTS, 0, numPoints);
  }

  let then = 0;
  function render(time: number) {
    // convert to seconds
    time *= 0.001;
    // Subtract the previous time from the current time
    const deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;

    engine.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    gl.clear(gl.COLOR_BUFFER_BIT);

    updatePointPositions(deltaTime);
    updateLineEndPoints(deltaTime);
    computeClosestLines();

    const matrix = orthographic(0, gl.canvas.width, 0, gl.canvas.height, -1, 1);

    drawAllLines(matrix);
    drawClosestLines(matrix);
    drawPoints(matrix);

    // swap
    {
      const temp = current;
      current = next;
      next = temp;
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
