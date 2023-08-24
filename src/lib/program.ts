export class Program {
  private _gl: WebGL2RenderingContext;
  private _program: WebGLProgram;

  constructor(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string,
    varyings?: string[]
  ) {
    this._gl = gl;
    this._program = this.createProgram(
      vertexShaderSource,
      fragmentShaderSource,
      varyings
    );
  }

  addAttrib(name: string) {
    return this._gl.getAttribLocation(this._program, name);
  }

  addUniform(name: string) {
    return this._gl.getUniformLocation(this._program, name)!;
  }

  use() {
    this._gl.useProgram(this._program);
  }

  // Private Methods
  private createProgram(
    vertexShaderSource: string,
    fragmentShaderSource: string,
    varyings?: string[]
  ) {
    const program = this._gl.createProgram() as WebGLProgram;
    if (!program) console.error(`failed to creat a program.`);

    const vertexShader = this.createShader(
      this._gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.createShader(
      this._gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    this._gl.attachShader(program, vertexShader!);
    this._gl.attachShader(program, fragmentShader!);

    if (varyings)
      this._gl.transformFeedbackVaryings(
        program,
        varyings,
        this._gl.SEPARATE_ATTRIBS
      );

    this._gl.linkProgram(program);

    const success = this._gl.getProgramParameter(program, this._gl.LINK_STATUS);
    if (!success) {
      console.error(this._gl.getProgramInfoLog(program));
      this._gl.deleteProgram(program);
    }
    return program;
  }

  private createShader(type: number, source: string) {
    const gl = this._gl;

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
