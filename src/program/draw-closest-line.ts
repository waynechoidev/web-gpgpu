import { Engine } from "../lib/engine";
import { Program } from "../lib/program";
import { drawClosestLinesVS } from "../shader/draw-closest-line";
import { drawClosestLinesPointsFS } from "../shader/draw-fragment";

export class DrawClosestLines extends Program {
  private _closestNdx: number;
  private _linesTex: WebGLUniformLocation;
  private _matrix: WebGLUniformLocation;
  private _numPoints: WebGLUniformLocation;

  constructor(engine: Engine) {
    super(engine, drawClosestLinesVS, drawClosestLinesPointsFS);

    this._closestNdx = this.addAttrib("closestNdx");
    this._linesTex = this.addUniform("linesTex");
    this._matrix = this.addUniform("matrix");
    this._numPoints = this.addUniform("numPoints");
  }
  get closestNdx() {
    return this._closestNdx;
  }
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
