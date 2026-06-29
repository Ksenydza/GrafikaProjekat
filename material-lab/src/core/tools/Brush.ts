import type { CellCoord } from '../../shared/types';
import { MaterialType } from '../materials/Material';
import type { Grid } from '../grid/Grid';
import { getLinePoints } from './Bresenham';

export class Brush {
  size:         number;
  materialType: MaterialType;

  constructor(size = 3, materialType: MaterialType = MaterialType.Sand) {
    this.size         = size;
    this.materialType = materialType;
  }

  /**
   * Returns true when `selected` is allowed to replace `existing`.
   *
   * - Concrete: overwrites anything (it is a structural blocker).
   * - Empty/Erase: clears anything.
   * - Dynamic materials (Sand, Water, Acid, WeakAcid): only place on Empty;
   *   they must not overwrite structural or other dynamic cells.
   */
  private canPaint(existing: MaterialType): boolean {
    if (this.materialType === MaterialType.Concrete) return true;
    if (this.materialType === MaterialType.Empty)    return true;
    return existing === MaterialType.Empty;
  }

  /**
   * Returns true if any cell inside the brush circle centred on `center`
   * contains Concrete. Uses the same filled-circle shape as paint().
   */
  private brushOverlapsConcrete(grid: Grid, center: CellCoord): boolean {
    const r = this.size;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const x = center.x + dx;
          const y = center.y + dy;
          if (grid.inBounds(x, y) && grid.get(x, y) === MaterialType.Concrete) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Returns true when this material's stroke can be stopped by Concrete overlap.
   * Acid is exempt: it is intended to flow alongside Concrete and erode it through
   * physics, not through brush writes. Concrete and Erase are never blocked.
   */
  private isStrokeBlockedByConcrete(): boolean {
    return this.materialType !== MaterialType.Concrete
        && this.materialType !== MaterialType.Empty
        && this.materialType !== MaterialType.Acid;
  }

  /**
   * Returns false when a dynamic brush would be blocked at `center` before a stroke
   * could even begin. Concrete, Erase, and Acid always return true (never blocked).
   * Used by handleMouseDown to decide whether to start a drag at all.
   */
  canStartStroke(grid: Grid, center: CellCoord): boolean {
    if (!this.isStrokeBlockedByConcrete()) return true;
    return !this.brushOverlapsConcrete(grid, center);
  }

  /** Stamps a filled circle of radius `size` centred on `center`. */
  paint(grid: Grid, center: CellCoord): void {
    const r = this.size;

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const x = center.x + dx;
          const y = center.y + dy;
          if (grid.inBounds(x, y) && this.canPaint(grid.get(x, y))) {
            grid.set(x, y, this.materialType);
          }
        }
      }
    }
  }

  /**
   * Paints a filled circle at every cell along the line from `from` to `to`.
   * Prevents gaps in the trail when the mouse moves faster than one cell per frame.
   *
   * Returns true  — stroke completed with no Concrete collision.
   * Returns false — stroke hit Concrete and stopped early; the blocked point was
   *                 NOT painted. The caller should cancel the active drag so that
   *                 the next mousemove event does not resume on the far side of the wall.
   *
   * Concrete and Erase brushes are never blocked and always return true.
   */
  paintLine(grid: Grid, from: CellCoord, to: CellCoord): boolean {
    const checkConcrete = this.isStrokeBlockedByConcrete();

    for (const point of getLinePoints(from, to)) {
      if (checkConcrete && this.brushOverlapsConcrete(grid, point)) {
        return false; // blocked — caller must stop the drag
      }
      this.paint(grid, point);
    }
    return true;
  }
}
