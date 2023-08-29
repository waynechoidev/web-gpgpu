import { Engine } from "./engine";

export class Program {
  protected _engine: Engine;
  private _program: WebGLProgram;
  private _VA: WebGLVertexArrayObject[] = [];

  constructor(
    engine: Engine,
    vertexShaderSource: string,
    fragmentShaderSource: string,
    varyings?: string[]
  ) {
    this._engine = engine;
    this._program = this.createProgram(
      vertexShaderSource,
      fragmentShaderSource,
      varyings
    );
  }

  get VA() {
    return this._VA;
  }
  set VA(VAs: WebGLVertexArrayObject[]) {
    this._VA = VAs;
  }

  addAttrib(name: string) {
    return this._engine.gl.getAttribLocation(this._program, name);
  }

  addUniform(name: string) {
    return this._engine.gl.getUniformLocation(this._program, name)!;
  }

  use() {
    this._engine.gl.useProgram(this._program);
  }

  // Private Methods
  private createProgram(
    vertexShaderSource: string,
    fragmentShaderSource: string,
    varyings?: string[]
  ) {
    const gl = this._engine.gl;

    const program = gl.createProgram() as WebGLProgram;
    if (!program) console.error(`failed to creat a program.`);

    const vertexShader = this.createShader(
      gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    gl.attachShader(program, vertexShader!);
    gl.attachShader(program, fragmentShader!);

    if (varyings)
      gl.transformFeedbackVaryings(program, varyings, gl.SEPARATE_ATTRIBS);

    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
    }
    return program;
  }

  private createShader(type: number, source: string) {
    const gl = this._engine.gl;

    const shader = gl.createShader(type);
    if (shader) {
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) {
        return shader;
      }

      console.log(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    } else {
      console.error(`failed to creat a shader type ${type}.`);
    }
  }
}
