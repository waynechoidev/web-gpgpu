import { Engine } from "../lib/engine";
import { Program } from "../lib/program";
import { drawClosestLinesPointsFS } from "../shader/draw-fragment";
import { drawPointsVS } from "../shader/draw-points";

export class DrawPoints extends Program {
  private _point: number;
  private _matrix: WebGLUniformLocation;
  private _numPoints: WebGLUniformLocation;

  constructor(engine: Engine) {
    super(engine, drawPointsVS, drawClosestLinesPointsFS);

    this._point = this.addAttrib("point");
    this._matrix = this.addUniform("matrix");
    this._numPoints = this.addUniform("numPoints");
  }
  get point() {
    return this._point;
  }
  get matrix() {
    return this._matrix;
  }
  get numPoints() {
    return this._numPoints;
  }
}
