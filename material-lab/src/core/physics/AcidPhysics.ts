import { MaterialType, getMaterial } from '../materials/Material';
import type { Grid } from '../grid/Grid';

/** Baseline erosion probability that is scaled by a material's erodesConcretePower. */
const BASE_EROSION_CHANCE = 0.25;

/** Probability that an Acid cell touching Water converts both cells to WeakAcid per tick. */
const ACID_DILUTION_CHANCE = 0.30;

/** Probability that a WeakAcid cell touching Water converts that Water cell to WeakAcid per tick. */
const WEAK_ACID_SPREAD_CHANCE = 0.10;

const OFFSETS: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

/**
 * Returns true when the mover (at myDensity) can displace `cell` downward.
 * Heavier liquids sink through lighter ones; non-liquids (Concrete, Sand) block all.
 * Empty is always enterable.
 */
function canMoveLiquidDown(cell: MaterialType, myDensity: number): boolean {
  if (cell === MaterialType.Empty) return true;
  const def = getMaterial(cell);
  return def.isLiquid && myDensity > def.density;
}

/**
 * Moves the liquid cell at (x, y) one step.
 * Downward and diagonal-downward moves respect density: a heavier liquid can displace
 * a lighter one by swapping. Horizontal spread only enters Empty cells (no lateral
 * density swapping, which would cause chaotic sideways churn).
 */
export function moveLiquidCell(grid: Grid, x: number, y: number, myType: MaterialType): void {
  const myDensity   = getMaterial(myType).density;
  const ny          = y + 1;
  const belowExists = grid.inBounds(x, ny);
  const leftFirst   = Math.random() < 0.5;
  const dx1         = leftFirst ? -1 : 1;
  const dx2         = leftFirst ?  1 : -1;

  // 1. Fall straight down — into Empty or a lighter liquid.
  if (belowExists && canMoveLiquidDown(grid.get(x, ny), myDensity)) {
    grid.swap(x, y, x, ny);
    return;
  }

  // 2. Slide diagonally down — same density rules.
  if (belowExists) {
    if (grid.inBounds(x + dx1, ny) && canMoveLiquidDown(grid.get(x + dx1, ny), myDensity)) {
      grid.swap(x, y, x + dx1, ny);
      return;
    }
    if (grid.inBounds(x + dx2, ny) && canMoveLiquidDown(grid.get(x + dx2, ny), myDensity)) {
      grid.swap(x, y, x + dx2, ny);
      return;
    }
  }

  // 3. Spread horizontally — only into Empty; no sideways density swapping.
  if (grid.inBounds(x + dx1, y) && grid.get(x + dx1, y) === MaterialType.Empty) {
    grid.swap(x, y, x + dx1, y);
  } else if (grid.inBounds(x + dx2, y) && grid.get(x + dx2, y) === MaterialType.Empty) {
    grid.swap(x, y, x + dx2, y);
  }
}

/**
 * Attempts to erode one adjacent Concrete cell.
 * Probability = BASE_EROSION_CHANCE × power.
 * Stops after the first successful erosion (one block per cell per tick).
 */
export function erodeConcreteNeighbour(grid: Grid, x: number, y: number, power: number): void {
  for (const [dx, dy] of OFFSETS) {
    const nx = x + dx;
    const ny = y + dy;
    if (grid.inBounds(nx, ny) && grid.get(nx, ny) === MaterialType.Concrete) {
      if (Math.random() < BASE_EROSION_CHANCE * power) {
        grid.set(nx, ny, MaterialType.Empty);
        return;
      }
    }
  }
}

/**
 * Gradual dilution pass — two independent sub-passes per tick:
 *
 *   1. Acid + Water contact (ACID_DILUTION_CHANCE):
 *      Both cells become WeakAcid. One Water neighbour per Acid cell per tick.
 *
 *   2. WeakAcid + Water contact (WEAK_ACID_SPREAD_CHANCE):
 *      The Water cell becomes WeakAcid. One Water neighbour per WeakAcid cell per tick.
 *
 * Must run before updateAcid so that newly diluted cells are skipped by the
 * full-Acid erosion pass (which only acts on cells still typed as Acid).
 */
export function updateAcidWaterDilution(grid: Grid): void {
  // Sub-pass 1: Acid + Water → WeakAcid + WeakAcid
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      if (grid.get(x, y) !== MaterialType.Acid) continue;

      for (const [dx, dy] of OFFSETS) {
        const nx = x + dx;
        const ny = y + dy;
        if (grid.inBounds(nx, ny) && grid.get(nx, ny) === MaterialType.Water) {
          if (Math.random() < ACID_DILUTION_CHANCE) {
            grid.set(x,  y,  MaterialType.WeakAcid);
            grid.set(nx, ny, MaterialType.WeakAcid);
          }
          break; // one Water neighbour per Acid cell per tick
        }
      }
    }
  }

  // Sub-pass 2: WeakAcid + Water → Water becomes WeakAcid
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      if (grid.get(x, y) !== MaterialType.WeakAcid) continue;

      for (const [dx, dy] of OFFSETS) {
        const nx = x + dx;
        const ny = y + dy;
        if (grid.inBounds(nx, ny) && grid.get(nx, ny) === MaterialType.Water) {
          if (Math.random() < WEAK_ACID_SPREAD_CHANCE) {
            grid.set(nx, ny, MaterialType.WeakAcid);
          }
          break; // one Water neighbour per WeakAcid cell per tick
        }
      }
    }
  }
}

export function updateAcid(grid: Grid): void {
  const acidPower = getMaterial(MaterialType.Acid).erodesConcretePower; // 1.0 → 25%

  // Pass 1: movement — bottom-to-top so falling cells aren't processed twice.
  for (let y = grid.rows - 1; y >= 0; y--) {
    for (let x = 0; x < grid.cols; x++) {
      if (grid.get(x, y) !== MaterialType.Acid) continue;
      moveLiquidCell(grid, x, y, MaterialType.Acid);
    }
  }

  // Pass 2: erosion — diluted cells are now WeakAcid and are skipped by the type check.
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      if (grid.get(x, y) !== MaterialType.Acid) continue;
      erodeConcreteNeighbour(grid, x, y, acidPower);
    }
  }
}
