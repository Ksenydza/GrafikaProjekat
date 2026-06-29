import { MaterialType } from '../materials/Material';
import type { Grid } from '../grid/Grid';

/** Returns true for every material that sand (density 1.5) is dense enough to sink through. */
function canSandDisplace(type: MaterialType): boolean {
  return type === MaterialType.Empty
    || type === MaterialType.Water
    || type === MaterialType.Acid
    || type === MaterialType.WeakAcid;
}

export function updateSand(grid: Grid): void {
  // Iterate bottom-to-top so a falling grain is never processed twice in the same tick.
  for (let y = grid.rows - 1; y >= 0; y--) {
    for (let x = 0; x < grid.cols; x++) {
      if (grid.get(x, y) !== MaterialType.Sand) continue;

      const ny = y + 1;
      if (!grid.inBounds(x, ny)) continue; // already on the bottom edge

      // 1. Fall straight down (into Empty, Water, Acid, or WeakAcid)
      if (canSandDisplace(grid.get(x, ny))) {
        grid.swap(x, y, x, ny);
        continue;
      }

      // 2. Slide diagonally — randomize preference so piles form symmetric cones
      const leftFirst = Math.random() < 0.5;
      const dx1       =  leftFirst ? -1 : 1;
      const dx2       =  leftFirst ?  1 : -1;

      if (grid.inBounds(x + dx1, ny) && canSandDisplace(grid.get(x + dx1, ny))) {
        grid.swap(x, y, x + dx1, ny);
      } else if (grid.inBounds(x + dx2, ny) && canSandDisplace(grid.get(x + dx2, ny))) {
        grid.swap(x, y, x + dx2, ny);
      }
      // else: grain is fully blocked — stay in place
    }
  }
}
