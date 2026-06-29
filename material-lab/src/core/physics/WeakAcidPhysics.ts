import { MaterialType, getMaterial } from '../materials/Material';
import type { Grid } from '../grid/Grid';
import { moveLiquidCell, erodeConcreteNeighbour } from './AcidPhysics';

export function updateWeakAcid(grid: Grid): void {
  // erodesConcretePower = 0.1 → effective erosion chance = 0.25 × 0.1 = 2.5%
  const weakAcidPower = getMaterial(MaterialType.WeakAcid).erodesConcretePower;

  // Pass 1: movement — WeakAcid (density 0.9) sinks through Acid (0.8) but not Water (1.0).
  for (let y = grid.rows - 1; y >= 0; y--) {
    for (let x = 0; x < grid.cols; x++) {
      if (grid.get(x, y) !== MaterialType.WeakAcid) continue;
      moveLiquidCell(grid, x, y, MaterialType.WeakAcid);
    }
  }

  // Pass 2: erosion — reads power from the material definition, not a hardcoded value.
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      if (grid.get(x, y) !== MaterialType.WeakAcid) continue;
      erodeConcreteNeighbour(grid, x, y, weakAcidPower);
    }
  }
}
