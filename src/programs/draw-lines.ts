import { matrix, numLineSegments } from "../lib/constants";
import { Engine } from "../lib/engine";
import { Program } from "../lib/program";
import { BufferContainer } from "../lib/utils";
import { drawClosestLinesPointsFS } from "../shaders/draw-fragment";
import { drawLinesVS } from "../shaders/draw-lines";

interface DrawClosestLinesParams {
  engine: Engine;
}

export class DrawLines extends Program {
  private _linesTex: WebGLUniformLocation;
  private _matrix: WebGLUniformLocation;

  constructor(params: DrawClosestLinesParams) {
    const { engine } = params;

    super(engine, drawLinesVS, drawClosestLinesPointsFS);

    this._linesTex = this.addUniform("linesTex");
    this._matrix = this.addUniform("matrix");
  }

  use(container: BufferContainer) {
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);

    this._gl.bindVertexArray(null);
    this.useProgram();

    // bind the lines texture to texture unit 0
    this._gl.activeTexture(this._gl.TEXTURE0);
    this._gl.bindTexture(this._gl.TEXTURE_2D, container.allLinesTex);

    // Tell the shader to use texture on texture unit 0
    this._gl.uniform1i(this.linesTex, 0);
    this._gl.uniformMatrix4fv(this.matrix, false, matrix);

    this._gl.drawArrays(this._gl.LINES, 0, numLineSegments * 2);
  }

  // Uniforms
  get linesTex() {
    return this._linesTex;
  }
  get matrix() {
    return this._matrix;
  }
}
