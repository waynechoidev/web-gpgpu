import { matrix, numPoints } from "../lib/constants";
import { Engine } from "../lib/engine";
import { Program } from "../lib/program";
import { BufferContainer } from "../lib/utils";
import { drawClosestLinesPointsFS } from "../shaders/draw-fragment";
import { drawPointsVS } from "../shaders/draw-points";

interface DrawPointsParams {
  engine: Engine;
  pointsBuffer1: WebGLBuffer;
  pointsBuffer2: WebGLBuffer;
}

export class DrawPoints extends Program {
  private _point: number;
  private _matrix: WebGLUniformLocation;
  private _numPoints: WebGLUniformLocation;
  private _VA1: WebGLVertexArrayObject;
  private _VA2: WebGLVertexArrayObject;

  constructor(params: DrawPointsParams) {
    const { engine, pointsBuffer1, pointsBuffer2 } = params;

    super(engine, drawPointsVS, drawClosestLinesPointsFS);

    this._point = this.addAttrib("point");
    this._matrix = this.addUniform("matrix");
    this._numPoints = this.addUniform("numPoints");

    this._VA1 = this._engine.makeVertexArray({
      bufLocPairs: [[pointsBuffer1, this._point]],
      numElements: 2,
    });

    this._VA2 = this._engine.makeVertexArray({
      bufLocPairs: [[pointsBuffer2, this._point]],
      numElements: 2,
    });
  }

  use(container: BufferContainer) {
    this._gl.bindVertexArray(container.drawPointsVA);
    this.useProgram();

    this._gl.uniform1f(this.numPoints, numPoints);
    this._gl.uniformMatrix4fv(this.matrix, false, matrix);

    this._gl.drawArrays(this._gl.POINTS, 0, numPoints);
  }

  // Vertex Array
  get VA1() {
    return this._VA1;
  }
  get VA2() {
    return this._VA2;
  }

  // Uniforms
  get matrix() {
    return this._matrix;
  }
  get numPoints() {
    return this._numPoints;
  }
}
