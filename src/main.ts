import { Engine } from "./engine";
import { drawParticlesFS, drawParticlesVS } from "./shader/draw-particles";
import { updatePositionFS, updatePositionVS } from "./shader/update-position";
import "./style.css";
import { createPoints } from "./utils";

const canvasWidth = 800;
const canvasHeight = 600;
const numParticles = 200;

function main() {
  const engine = new Engine(canvasWidth, canvasHeight);
  const updatePositionProgram = engine.createProgram(
    updatePositionVS,
    updatePositionFS,
    ["newPosition"]
  );
  const drawParticlesProgram = engine.createProgram(
    drawParticlesVS,
    drawParticlesFS
  );
  if (!updatePositionProgram || !drawParticlesProgram) return;

  const gl = engine.gl;
  const updatePositionPrgLocs = {
    oldPosition: gl.getAttribLocation(updatePositionProgram, "oldPosition"),
    velocity: gl.getAttribLocation(updatePositionProgram, "velocity"),
    canvasDimensions: gl.getUniformLocation(
      updatePositionProgram,
      "canvasDimensions"
    ),
    deltaTime: gl.getUniformLocation(updatePositionProgram, "deltaTime"),
  };

  const drawParticlesProgLocs = {
    position: gl.getAttribLocation(drawParticlesProgram, "position"),
    matrix: gl.getUniformLocation(drawParticlesProgram, "matrix"),
  };

  const positions = new Float32Array(
    createPoints(numParticles, [[canvasWidth], [canvasHeight]])
  );
  const velocities = new Float32Array(
    createPoints(numParticles, [
      [-300, 300],
      [-300, 300],
    ])
  );

  const position1Buffer = engine.makeBuffer(positions, gl.DYNAMIC_DRAW);
  const position2Buffer = engine.makeBuffer(positions, gl.DYNAMIC_DRAW);
  const velocityBuffer = engine.makeBuffer(velocities, gl.STATIC_DRAW);

  const updatePositionVA1 = engine.makeVertexArray([
    [position1Buffer!, updatePositionPrgLocs.oldPosition],
    [velocityBuffer!, updatePositionPrgLocs.velocity],
  ]);
  const updatePositionVA2 = engine.makeVertexArray([
    [position2Buffer!, updatePositionPrgLocs.oldPosition],
    [velocityBuffer!, updatePositionPrgLocs.velocity],
  ]);

  const drawVA1 = engine.makeVertexArray([
    [position1Buffer!, drawParticlesProgLocs.position],
  ]);
  const drawVA2 = engine.makeVertexArray([
    [position2Buffer!, drawParticlesProgLocs.position],
  ]);

  const tf1 = engine.makeTransformFeedback(position1Buffer!);
  const tf2 = engine.makeTransformFeedback(position2Buffer!);

  // unbind left over stuff
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

  let current = {
    updateVA: updatePositionVA1, // read from position1
    tf: tf2, // write to position2
    drawVA: drawVA2, // draw with position2
  };
  let next = {
    updateVA: updatePositionVA2, // read from position2
    tf: tf1, // write to position1
    drawVA: drawVA1, // draw with position1
  };

  let then = 0;

  function render(time: number) {
    // convert to seconds
    time *= 0.001;
    // Subtract the previous time from the current time
    const deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;

    gl.clear(gl.COLOR_BUFFER_BIT);

    // compute the new positions
    gl.useProgram(updatePositionProgram!);
    gl.bindVertexArray(current.updateVA);
    gl.uniform2f(
      updatePositionPrgLocs.canvasDimensions,
      gl.canvas.width,
      gl.canvas.height
    );
    gl.uniform1f(updatePositionPrgLocs.deltaTime, deltaTime);

    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, current.tf);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, numParticles);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    // turn on using fragment shaders again
    gl.disable(gl.RASTERIZER_DISCARD);

    // now draw the particles.
    gl.useProgram(drawParticlesProgram!);
    gl.bindVertexArray(current.drawVA);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniformMatrix4fv(
      drawParticlesProgLocs.matrix,
      false,
      // m4.orthographic(0, gl.canvas.width, 0, gl.canvas.height, -1, 1))
      [
        0.0024999999441206455, 0, 0, 0, 0, 0.0033333334140479565, 0, 0, 0, 0,
        -1, 0, -1, -1, 0, 1,
      ]
    );
    gl.drawArrays(gl.POINTS, 0, numParticles);

    // swap which buffer we will read from
    // and which one we will write to
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
