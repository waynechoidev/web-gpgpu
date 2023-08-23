export const rand = (min: number, max?: number) => {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
};

export const createPoints = (num: number, ranges: number[][]) =>
  new Array(num)
    .fill(0)
    .map((_) => ranges.map((range) => rand(range[0], range[1])))
    .flat();
