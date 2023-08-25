import { Engine } from "./lib/engine";
import "./style.css";
import { createPoints, orthographic, swapBuffers } from "./lib/utils";
import { UpdatePosition } from "./program/update-position";
import { DrawParticles } from "./program/draw-particles";

const NUM_OF_PARTICLES = 3000;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

function main() {
  const engine = new Engine(WIDTH, HEIGHT);
  const gl = engine.gl;

  const updatePositionProgram = new UpdatePosition(gl);
  const drawParticlesProgram = new DrawParticles(gl);

  const positions = new Float32Array(
    createPoints(NUM_OF_PARTICLES, [[WIDTH], [HEIGHT]])
  );
  const velocities = new Float32Array(
    createPoints(NUM_OF_PARTICLES, [
      [-300, 300],
      [-300, 300],
    ])
  );

  const position1Buffer = engine.makeBuffer(positions, gl.DYNAMIC_DRAW);
  const position2Buffer = engine.makeBuffer(positions, gl.DYNAMIC_DRAW);
  const velocityBuffer = engine.makeBuffer(velocities, gl.STATIC_DRAW);

  const updatePositionVA1 = engine.makeVertexArray([
    [position1Buffer!, updatePositionProgram.oldPosition],
    [velocityBuffer!, updatePositionProgram.velocity],
  ]);

  const updatePositionVA2 = engine.makeVertexArray([
    [position2Buffer!, updatePositionProgram.oldPosition],
    [velocityBuffer!, updatePositionProgram.velocity],
  ]);

  const drawVA1 = engine.makeVertexArray([
    [position1Buffer!, drawParticlesProgram.position],
  ]);

  const drawVA2 = engine.makeVertexArray([
    [position2Buffer!, drawParticlesProgram.position],
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
    updatePositionProgram.use();
    gl.bindVertexArray(current.updateVA);
    gl.uniform2f(
      updatePositionProgram.canvasDimensions,
      gl.canvas.width,
      gl.canvas.height
    );
    gl.uniform1f(updatePositionProgram.deltaTime, deltaTime);

    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, current.tf);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, NUM_OF_PARTICLES);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    // turn on using fragment shaders again
    gl.disable(gl.RASTERIZER_DISCARD);

    // now draw the particles.
    drawParticlesProgram.use();
    gl.bindVertexArray(current.drawVA);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniformMatrix4fv(
      drawParticlesProgram.matrix,
      false,
      orthographic(0, gl.canvas.width, 0, gl.canvas.height, -1, 1)
    );
    gl.drawArrays(gl.POINTS, 0, NUM_OF_PARTICLES);

    // swap which buffer we will read from
    // and which one we will write to
    swapBuffers(current, next);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
