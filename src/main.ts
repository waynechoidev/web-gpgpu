import { Engine } from "./lib/engine";
import "./style.css";
import { ComputeClosestLine } from "./programs/compute-closest-line";
import { BufferContainer, swapBuffers } from "./lib/utils";
import { DrawLines } from "./programs/draw-lines";
import { DrawClosestLines } from "./programs/draw-closest-line";
import { DrawPoints } from "./programs/draw-points";
import { UpdatePosition } from "./programs/update-position";
import { UpdateLines } from "./programs/update-lines";
import {
  HEIGHT,
  WIDTH,
  lineVelocities,
  lines,
  numPoints,
  pointVelocities,
  points,
  quadArr,
} from "./lib/constants";

function main() {
  const engine = new Engine(WIDTH, HEIGHT);
  const gl = engine.gl;

  // Buffers
  const closestNdxBuffer = engine.makeBuffer(
    new Float32Array(numPoints),
    gl.STATIC_DRAW
  );
  const quadBuffer = engine.makeBuffer(
    new Float32Array(quadArr),
    gl.STATIC_DRAW
  );
  const pointsBuffer1 = engine.makeBuffer(points, gl.DYNAMIC_DRAW);
  const pointsBuffer2 = engine.makeBuffer(points, gl.DYNAMIC_DRAW);
  const pointVelocitiesBuffer = engine.makeBuffer(
    pointVelocities,
    gl.DYNAMIC_DRAW
  );

  // Textures
  const { tex: linesTex1 } = engine.createDataTexture(
    lines,
    2,
    gl.RG32F,
    gl.RG,
    gl.FLOAT
  );
  const { tex: linesTex2 } = engine.createDataTexture(
    lines,
    2,
    gl.RG32F,
    gl.RG,
    gl.FLOAT
  );
  const { tex: lineVelocitiesTex, dimensions: lineVelocitiesTexDimensions } =
    engine.createDataTexture(lineVelocities, 2, gl.RG32F, gl.RG, gl.FLOAT);

  // Programs
  const updatePositionPrg = new UpdatePosition({
    engine,
    pointsBuffer1,
    pointsBuffer2,
    pointVelocitiesBuffer,
  });
  const updateLinesPrg = new UpdateLines({ engine, quadBuffer });
  const computeClosestLinePrg = new ComputeClosestLine({
    engine,
    pointsBuffer1,
    pointsBuffer2,
  });
  const drawLinesPrg = new DrawLines({ engine });
  const drawClosestLinesPrg = new DrawClosestLines({
    engine,
    closestNdxBuffer,
  });
  const drawPointsPrg = new DrawPoints({
    engine,
    pointsBuffer1,
    pointsBuffer2,
  });

  // Transform Feedbacks
  const pointsTF1 = engine.makeTransformFeedback(pointsBuffer1);
  const pointsTF2 = engine.makeTransformFeedback(pointsBuffer2);

  const closestNdxTF = engine.makeTransformFeedback(closestNdxBuffer);

  // Frame Buffers
  const linesFB1 = engine.createFramebuffer(linesTex1);
  const linesFB2 = engine.createFramebuffer(linesTex2);

  // Buffer Containers
  let current: BufferContainer = {
    // for updating points
    updatePositionVA: updatePositionPrg.VA1, // read from points1
    pointsTF: pointsTF2, // write to points2
    // for updating line endings
    linesTex: linesTex1, // read from linesTex1
    linesFB: linesFB2, // write to linesTex2
    // for computing closest lines
    closestLinesVA: computeClosestLinePrg.VA1, // read from points2
    // for drawing all lines and closest lines
    allLinesTex: linesTex2, // read from linesTex2
    // for drawing points
    drawPointsVA: drawPointsPrg.VA2, // read form points2
  };
  let next: BufferContainer = {
    // for updating points
    updatePositionVA: updatePositionPrg.VA2, // read from points2
    pointsTF: pointsTF1, // write to points1
    // for updating line endings
    linesTex: linesTex2, // read from linesTex2
    linesFB: linesFB1, // write to linesTex1
    // for computing closest lines
    closestLinesVA: computeClosestLinePrg.VA2, // read from points1
    // for drawing all lines and closest lines
    allLinesTex: linesTex1, // read from linesTex1
    // for drawing points
    drawPointsVA: drawPointsPrg.VA1, // read form points1
  };

  // initialize buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

  let then = 0;
  function render(time: number) {
    // convert to seconds
    time *= 0.001;
    // Subtract the previous time from the current time
    const deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;

    gl.clear(gl.COLOR_BUFFER_BIT);

    updatePositionPrg.use(current, deltaTime);
    updateLinesPrg.use(
      current,
      deltaTime,
      lineVelocitiesTex,
      lineVelocitiesTexDimensions
    );
    computeClosestLinePrg.use(current, closestNdxTF);

    drawLinesPrg.use(current);
    drawClosestLinesPrg.use(current);
    drawPointsPrg.use(current);

    swapBuffers(current, next);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
