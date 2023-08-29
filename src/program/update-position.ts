import { Engine } from "../lib/engine";
import { Program } from "../lib/program";
import { updatePositionFS, updatePositionVS } from "../shader/update-position";

export class UpdatePosition extends Program {
  private _oldPosition: number;
  private _velocity: number;
  private _canvasDimensions: WebGLUniformLocation;
  private _deltaTime: WebGLUniformLocation;

  constructor(engine: Engine) {
    super(engine, updatePositionVS, updatePositionFS, ["newPosition"]);

    this._oldPosition = this.addAttrib("oldPosition");
    this._velocity = this.addAttrib("velocity");
    this._canvasDimensions = this.addUniform("canvasDimensions");
    this._deltaTime = this.addUniform("deltaTime");
  }

  // update(deltaTime: number, VA: WebGLVertexArrayObject) {
  //   const gl = this._gl;
  //   gl.bindVertexArray(VA);
  //   this.use();
  //   gl.uniform1f(this._deltaTime, deltaTime);
  //   gl.uniform2f(this._canvasDimensions, gl.canvas.width, gl.canvas.height);
  //   engine.drawArraysWithTransformFeedback(
  //     current.pointsTF!,
  //     gl.POINTS,
  //     numPoints
  //   );
  // }

  get oldPosition() {
    return this._oldPosition;
  }
  get velocity() {
    return this._velocity;
  }
  get canvasDimensions() {
    return this._canvasDimensions;
  }
  get deltaTime() {
    return this._deltaTime;
  }
}
