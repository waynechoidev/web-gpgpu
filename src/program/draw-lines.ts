import { Engine } from "../lib/engine";
import { Program } from "../lib/program";
import { drawClosestLinesPointsFS } from "../shader/draw-fragment";
import { drawLinesVS } from "../shader/draw-lines";

export class DrawLines extends Program {
  private _linesTex: WebGLUniformLocation;
  private _matrix: WebGLUniformLocation;

  constructor(engine: Engine) {
    super(engine, drawLinesVS, drawClosestLinesPointsFS);

    this._linesTex = this.addUniform("linesTex");
    this._matrix = this.addUniform("matrix");
  }
  get linesTex() {
    return this._linesTex;
  }
  get matrix() {
    return this._matrix;
  }
}
