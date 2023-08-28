export const rand = (min: number, max?: number) => {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
};

export const createPoints = (num: number, ranges: number[][]) =>
  new Float32Array(
    new Array(num)
      .fill(0)
      .map((_) => ranges.map((range) => rand(range[0], range[1])))
      .flat()
  );

export const orthographic = (
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number
) => {
  return new Float32Array([
    2 / (right - left),
    0,
    0,
    0,
    0,
    2 / (top - bottom),
    0,
    0,
    0,
    0,
    2 / (near - far),
    0,

    (left + right) / (left - right),
    (bottom + top) / (bottom - top),
    (near + far) / (near - far),
    1,
  ]);
};

export const swapBuffers = (buffer1: object, buffer2: object) => {
  const temp = { ...buffer1 };
  Object.assign(buffer1, buffer2);
  Object.assign(buffer2, temp);
};
