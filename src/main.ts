import { Engine } from "./engine";
import { fragmentShaderSource } from "./shader/fragment";
import { vertexShaderSource } from "./shader/vertex";
import "./style.css";

const LENGTH = 6;

const a = new Float32Array([1, 2, 3, 4, 5, 6]);
const b = new Float32Array([3, 6, 9, 12, 15, 18]);
const sumResults = new Float32Array(LENGTH);
const differenceResults = new Float32Array(LENGTH);
const productResults = new Float32Array(LENGTH);

function main() {
  const engine = new Engine();
  const program = engine.createProgram(
    vertexShaderSource,
    fragmentShaderSource,
    ["sum", "difference", "product"]
  );
  if (!program) return;

  const gl = engine.gl;
  const aLoc = gl.getAttribLocation(program, "a");
  const bLoc = gl.getAttribLocation(program, "b");

  // Create a vertex array object (attribute state)
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // put data in buffers
  engine.makeBufferAndSetAttribute(a, aLoc);
  engine.makeBufferAndSetAttribute(b, bLoc);

  // Create and fill out a transform feedback
  const tf = gl.createTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);

  // make buffers for output
  const sumBuffer = engine.makeBuffer(sumResults);
  const differenceBuffer = engine.makeBuffer(differenceResults);
  const productBuffer = engine.makeBuffer(productResults);
  // 4 is size of Flaot32

  // bind the buffers to the transform feedback
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, sumBuffer);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, differenceBuffer);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, productBuffer);

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  // buffer's we are writing to can not be bound else where
  gl.bindBuffer(gl.ARRAY_BUFFER, null); // productBuffer was still bound to ARRAY_BUFFER so unbind it

  // above this line is setup
  // ---------------------------------
  // below this line is "render" time

  gl.useProgram(program);

  // bind our input attribute state for the a and b buffers
  gl.bindVertexArray(vao);

  // no need to call the fragment shader
  gl.enable(gl.RASTERIZER_DISCARD);

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, a.length);
  gl.endTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  // turn on using fragment shaders again
  gl.disable(gl.RASTERIZER_DISCARD);

  log(`a: ${a}`);
  log(`b: ${b}`);

  printResults(gl, sumResults, sumBuffer!, "sums");
  printResults(gl, differenceResults, differenceBuffer!, "differences");
  printResults(gl, productResults, productBuffer!, "products");

  function printResults(
    gl: WebGL2RenderingContext,
    results: Float32Array,
    buffer: WebGLBuffer,
    label: string
  ) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.getBufferSubData(
      gl.ARRAY_BUFFER,
      0, // byte offset into GPU buffer,
      results
    );
    // print the results
    log(`${label}: ${results}`);
  }

  function log(str: string) {
    const elem = document.createElement("pre");
    elem.textContent = str;
    document.body.appendChild(elem);
  }
}

main();
