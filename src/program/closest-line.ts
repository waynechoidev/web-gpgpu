import { Program } from "../lib/program";
import { closestLineFS, closestLineVS } from "../shader/compute";

export class ClosestLine extends Program {
  private _point: number;
  private _linesTex: WebGLUniformLocation;
  private _numLineSegments: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    super(gl, closestLineVS, closestLineFS, ["closestNdx"]);

    this._point = this.addAttrib("point");
    this._linesTex = this.addUniform("linesTex");
    this._numLineSegments = this.addUniform("numLineSegments");
  }
  get point() {
    return this._point;
  }
  get linesTex() {
    return this._linesTex;
  }
  get numLineSegments() {
    return this._numLineSegments;
  }
}
