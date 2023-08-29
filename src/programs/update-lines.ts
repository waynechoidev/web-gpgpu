import { Engine } from "../lib/engine";
import { Program } from "../lib/program";
import { BufferContainer } from "../lib/utils";
import { updateLinesFS, updateLinesVS } from "../shaders/update-lines";

interface UpdateLinesParams {
  engine: Engine;
  quadBuffer: WebGLBuffer;
}

export class UpdateLines extends Program {
  private _position: number;
  private _linesTex: WebGLUniformLocation;
  private _velocityTex: WebGLUniformLocation;
  private _canvasDimensions: WebGLUniformLocation;
  private _deltaTime: WebGLUniformLocation;
  private _VA: WebGLVertexArrayObject;

  constructor(params: UpdateLinesParams) {
    const { engine, quadBuffer } = params;

    super(engine, updateLinesVS, updateLinesFS);

    this._position = this.addAttrib("position");
    this._linesTex = this.addUniform("linesTex");
    this._velocityTex = this.addUniform("velocityTex");
    this._canvasDimensions = this.addUniform("canvasDimensions");
    this._deltaTime = this.addUniform("deltaTime");

    this._VA = this._engine.makeVertexArray({
      bufLocPairs: [[quadBuffer, this._position]],
      numElements: 2,
    });
  }

  use(
    container: BufferContainer,
    deltaTime: number,
    lineVelocitiesTex: WebGLTexture,
    lineVelocitiesTexDimensions: number[]
  ) {
    // Update the line endpoint positions ---------------------
    this._gl.bindVertexArray(this.VA); // just a quad
    this.useProgram();

    // bind texture to texture units 0 and 1
    this._gl.activeTexture(this._gl.TEXTURE0);
    this._gl.bindTexture(this._gl.TEXTURE_2D, container.linesTex);
    this._gl.activeTexture(this._gl.TEXTURE0 + 1);
    this._gl.bindTexture(this._gl.TEXTURE_2D, lineVelocitiesTex);

    // tell the shader to look at the textures on texture units 0 and 1
    this._gl.uniform1i(this.linesTex, 0);
    this._gl.uniform1i(this.velocityTex, 1);
    this._gl.uniform1f(this.deltaTime, deltaTime);
    this._gl.uniform2f(
      this.canvasDimensions,
      this._gl.canvas.width,
      this._gl.canvas.height
    );

    // write to the other lines texture
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, container.linesFB);
    this._gl.viewport(
      0,
      0,
      lineVelocitiesTexDimensions[0],
      lineVelocitiesTexDimensions[1]
    );

    // drawing a clip space -1 to +1 quad = map over entire destination array
    this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
  }

  // Vertex Array
  get VA() {
    return this._VA;
  }

  // Uniforms
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
