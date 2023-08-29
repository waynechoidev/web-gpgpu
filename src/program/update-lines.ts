import { Program } from "../lib/program";
import { updateLinesFS, updateLinesVS } from "../shader/update-lines";

export class UpdateLines extends Program {
  private _position: number;
  private _linesTex: WebGLUniformLocation;
  private _velocityTex: WebGLUniformLocation;
  private _canvasDimensions: WebGLUniformLocation;
  private _deltaTime: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    super(gl, updateLinesVS, updateLinesFS);

    this._position = this.addAttrib("position");
    this._linesTex = this.addUniform("linesTex");
    this._velocityTex = this.addUniform("velocityTex");
    this._canvasDimensions = this.addUniform("canvasDimensions");
    this._deltaTime = this.addUniform("deltaTime");
  }
  get position() {
    return this._position;
  }
  get linesTex() {
    return this._linesTex;
  }
  get velocityTex() {
    return this._velocityTex;
  }
  get canvasDimensions() {
    return this._canvasDimensions;
  }
  get deltaTime() {
    return this._deltaTime;
  }
}
