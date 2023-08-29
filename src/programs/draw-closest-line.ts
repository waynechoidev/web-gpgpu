import { matrix, numPoints } from "../lib/constants";
import { Engine } from "../lib/engine";
import { Program } from "../lib/program";
import { BufferContainer } from "../lib/utils";
import { drawClosestLinesVS } from "../shaders/draw-closest-line";
import { drawClosestLinesPointsFS } from "../shaders/draw-fragment";

interface DrawClosestLinesParams {
  engine: Engine;
  closestNdxBuffer: WebGLBuffer;
}

export class DrawClosestLines extends Program {
  private _closestNdx: number;
  private _linesTex: WebGLUniformLocation;
  private _matrix: WebGLUniformLocation;
  private _numPoints: WebGLUniformLocation;
  private _VA: WebGLVertexArrayObject;

  constructor(params: DrawClosestLinesParams) {
    const { engine, closestNdxBuffer } = params;

    super(engine, drawClosestLinesVS, drawClosestLinesPointsFS);

    this._closestNdx = this.addAttrib("closestNdx");
    this._linesTex = this.addUniform("linesTex");
    this._matrix = this.addUniform("matrix");
    this._numPoints = this.addUniform("numPoints");

    this._VA = this._engine.makeVertexArray({
      bufLocPairs: [[closestNdxBuffer, this._closestNdx]],
      dataType: this._gl.INT,
      numElements: 1,
      divisor: 1,
    });
  }

  use(container: BufferContainer) {
    this._gl.bindVertexArray(this.VA);
    this.useProgram();

    this._gl.activeTexture(this._gl.TEXTURE0);
    this._gl.bindTexture(this._gl.TEXTURE_2D, container.allLinesTex);

    this._gl.uniform1i(this.linesTex, 0);
    this._gl.uniform1f(this.numPoints, numPoints);
    this._gl.uniformMatrix4fv(this.matrix, false, matrix);

    this._gl.drawArraysInstanced(this._gl.LINES, 0, 2, numPoints);
  }

  // Vertex Array
  get VA() {
    return this._VA;
  }

  // Uniforms
  get linesTex() {
    return this._linesTex;
  }
  get matrix() {
    return this._matrix;
  }
  get numPoints() {
    return this._numPoints;
  }
}
