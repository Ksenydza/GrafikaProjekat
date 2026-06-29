import type { CellCoord } from '../../shared/types';

/**
 * Returns every grid cell on the line between `start` and `end` (inclusive)
 * using Bresenham's line algorithm.
 *
 * Handles all octants: horizontal, vertical, diagonal, steep, and reversed.
 */
export function getLinePoints(start: CellCoord, end: CellCoord): CellCoord[] {
  const points: CellCoord[] = [];

  let x = start.x;
  let y = start.y;

  const dx =  Math.abs(end.x - start.x);
  const dy =  Math.abs(end.y - start.y);
  const sx = start.x < end.x ? 1 : -1;
  const sy = start.y < end.y ? 1 : -1;

  let err = dx - dy;

  while (true) {
    points.push({ x, y });

    if (x === end.x && y === end.y) break;

    const e2 = 2 * err;

    // Step horizontally when error favours x
    if (e2 > -dy) {
      err -= dy;
      x   += sx;
    }

    // Step vertically when error favours y
    if (e2 < dx) {
      err += dx;
      y   += sy;
    }
  }

  return points;
}
