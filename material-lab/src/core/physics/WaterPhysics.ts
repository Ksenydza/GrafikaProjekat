import { MaterialType } from '../materials/Material';
import type { Grid } from '../grid/Grid';
import { moveLiquidCell } from './AcidPhysics';

export function updateWater(grid: Grid): void {
  // Water (density 1.0) is the heaviest liquid — sinks through Acid (0.8) and WeakAcid (0.9).
  // moveLiquidCell handles density-based downward displacement and Empty-only horizontal spread.
  for (let y = grid.rows - 1; y >= 0; y--) {
    for (let x = 0; x < grid.cols; x++) {
      if (grid.get(x, y) !== MaterialType.Water) continue;
      moveLiquidCell(grid, x, y, MaterialType.Water);
    }
  }
}
