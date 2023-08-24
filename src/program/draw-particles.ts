import { Program } from "../lib/program";
import { drawParticlesFS, drawParticlesVS } from "../shader/draw-particles";

export class DrawParticles extends Program {
  private _position: number;
  private _matrix: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    super(gl, drawParticlesVS, drawParticlesFS);

    this._position = this.addAttrib("position");
    this._matrix = this.addUniform("matrix");
  }
  get position() {
    return this._position;
  }
  get matrix() {
    return this._matrix;
  }
}
