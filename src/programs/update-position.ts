import { numPoints } from "../lib/constants";
import { Engine } from "../lib/engine";
import { Program } from "../lib/program";
import { BufferContainer } from "../lib/utils";
import { updatePositionFS, updatePositionVS } from "../shaders/update-position";

interface UpdatePositionParams {
  engine: Engine;
  pointsBuffer1: WebGLBuffer;
  pointsBuffer2: WebGLBuffer;
  pointVelocitiesBuffer: WebGLBuffer;
}

export class UpdatePosition extends Program {
  private _oldPosition: number;
  private _velocity: number;
  private _canvasDimensions: WebGLUniformLocation;
  private _deltaTime: WebGLUniformLocation;
  private _VA1: WebGLVertexArrayObject;
  private _VA2: WebGLVertexArrayObject;

  constructor(params: UpdatePositionParams) {
    const { engine, pointsBuffer1, pointsBuffer2, pointVelocitiesBuffer } =
      params;

    super(engine, updatePositionVS, updatePositionFS, ["newPosition"]);

    this._oldPosition = this.addAttrib("oldPosition");
    this._velocity = this.addAttrib("velocity");
    this._canvasDimensions = this.addUniform("canvasDimensions");
    this._deltaTime = this.addUniform("deltaTime");

    this._VA1 = this._engine.makeVertexArray({
      bufLocPairs: [
        [pointsBuffer1!, this._oldPosition],
        [pointVelocitiesBuffer!, this._velocity],
      ],
      numElements: 2,
    });

    this._VA2 = this._engine.makeVertexArray({
      bufLocPairs: [
        [pointsBuffer2!, this._oldPosition],
        [pointVelocitiesBuffer!, this._velocity],
      ],
      numElements: 2,
    });
  }

  use(container: BufferContainer, deltaTime: number) {
    this._gl.bindVertexArray(container.updatePositionVA);
    this.useProgram();

    this._gl.uniform1f(this._deltaTime, deltaTime);
    this._gl.uniform2f(
      this._canvasDimensions,
      this._gl.canvas.width,
      this._gl.canvas.height
    );
    this._engine.drawArraysWithTransformFeedback(
      container.pointsTF!,
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
  get canvasDimensions() {
    return this._canvasDimensions;
  }
  get deltaTime() {
    return this._deltaTime;
  }
}
