import { numLineSegments, numPoints } from "../lib/constants";
import { Engine } from "../lib/engine";
import { Program } from "../lib/program";
import { BufferContainer } from "../lib/utils";
import { closestLineFS, closestLineVS } from "../shaders/compute-closest-line";

interface ComputeClosestLineParams {
  engine: Engine;
  pointsBuffer1: WebGLBuffer;
  pointsBuffer2: WebGLBuffer;
}

export class ComputeClosestLine extends Program {
  private _point: number;
  private _linesTex: WebGLUniformLocation;
  private _numLineSegments: WebGLUniformLocation;
  private _VA1: WebGLVertexArrayObject;
  private _VA2: WebGLVertexArrayObject;

  constructor(params: ComputeClosestLineParams) {
    const { engine, pointsBuffer1, pointsBuffer2 } = params;

    super(engine, closestLineVS, closestLineFS, ["closestNdx"]);

    this._point = this.addAttrib("point");
    this._linesTex = this.addUniform("linesTex");
    this._numLineSegments = this.addUniform("numLineSegments");

    this._VA1 = this._engine.makeVertexArray({
      bufLocPairs: [[pointsBuffer1, this._point]],
      numElements: 2,
    });

    this._VA2 = this._engine.makeVertexArray({
      bufLocPairs: [[pointsBuffer2, this._point]],
      numElements: 2,
    });
  }

  use(container: BufferContainer, closestNdxTF: WebGLTransformFeedback) {
    this._gl.bindVertexArray(container.closestLinesVA);
    this.useProgram();

    this._gl.activeTexture(this._gl.TEXTURE0);
    this._gl.bindTexture(this._gl.TEXTURE_2D, container.linesTex);

    this._gl.uniform1i(this.linesTex, 0);
    this._gl.uniform1i(this.numLineSegments, numLineSegments);

    this._engine.drawArraysWithTransformFeedback(
      closestNdxTF,
      this._gl.POINTS,
      numPoints
    );
  }

  // Vertex Arrays
  get VA1() {
    return this._VA1;
  }
  get VA2() {
    return this._VA2;
  }

  // Uniforms
  get linesTex() {
    return this._linesTex;
  }
  get numLineSegments() {
    return this._numLineSegments;
  }
}
