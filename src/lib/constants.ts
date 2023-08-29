import { createPoints, orthographic } from "./utils";

export const WIDTH = window.innerWidth;
export const HEIGHT = window.innerHeight;
export const points = createPoints(8, [
  [0, WIDTH],
  [0, HEIGHT],
]);
export const lines = createPoints(125 * 2, [
  [0, WIDTH],
  [0, HEIGHT],
]);
export const numPoints = points.length / 2;
export const numLineSegments = lines.length / 2 / 2;

export const pointVelocities = createPoints(numPoints, [
  [-20, 20],
  [-20, 20],
]);
export const lineVelocities = createPoints(numLineSegments * 2, [
  [-20, 20],
  [-20, 20],
]);

export const quadArr = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

export const matrix = orthographic(0, WIDTH, 0, HEIGHT, -1, 1);
