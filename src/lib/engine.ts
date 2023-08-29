export class Engine {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext;

  constructor(width: number, height: number) {
    this._canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this._canvas.width = width;
    this._canvas.height = height;
    this._gl = this._canvas.getContext("webgl2") as WebGL2RenderingContext;
    if (!this._gl) alert("Cannot use webgl2");

    this.createWindow();
  }

  get gl() {
    return this._gl;
  }

  makeVertexArray(bufLocPairs: [WebGLBuffer, number][], numElements = 2) {
    const va = this._gl.createVertexArray();
    this._gl.bindVertexArray(va);
    for (const [buffer, loc] of bufLocPairs) {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
      this._gl.enableVertexAttribArray(loc);
      this._gl.vertexAttribPointer(
        loc, // attribute location
        numElements, // number of elements
        this._gl.FLOAT, // type of data
        false, // normalize
        0, // stride (0 = auto)
        0 // offset
      );
    }
    return va!;
  }

  makeTransformFeedback(buffer: WebGLBuffer) {
    const tf = this._gl.createTransformFeedback();
    this._gl.bindTransformFeedback(this._gl.TRANSFORM_FEEDBACK, tf);
    this._gl.bindBufferBase(this._gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
    return tf;
  }

  makeBuffer(sizeOrData: Float32Array, usage: number = this._gl.STATIC_DRAW) {
    const buf = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buf);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, sizeOrData, usage);
    return buf;
  }

  createDataTexture(
    data: Float32Array,
    numComponents: number,
    internalFormat: number,
    format: number,
    type: number
  ) {
    const gl = this._gl;

    const numElements = data.length / numComponents;

    // compute a size that will hold all of our data
    const width = Math.ceil(Math.sqrt(numElements));
    const height = Math.ceil(numElements / width);

    const bin = new Float32Array(width * height * numComponents);
    bin.set(data);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // mip level
      internalFormat,
      width,
      height,
      0, // border
      format,
      type,
      bin
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return { tex, dimensions: [width, height] };
  }

  createFramebuffer(tex: WebGLTexture) {
    const gl = this._gl;

    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0
    );
    return fb;
  }

  drawArraysWithTransformFeedback(
    tf: WebGLTransformFeedback,
    primitiveType: number,
    count: number
  ) {
    const gl = this._gl;

    // turn of using the fragment shader
    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(primitiveType, 0, count);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    // turn on using fragment shaders again
    gl.disable(gl.RASTERIZER_DISCARD);
  }

  private createWindow() {
    const gl = this._gl;
    this.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
  }

  private resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier = 1) {
    const width = (canvas.clientWidth * multiplier) | 0;
    const height = (canvas.clientHeight * multiplier) | 0;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }
}
