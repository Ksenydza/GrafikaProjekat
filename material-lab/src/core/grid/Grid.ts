import { MaterialType } from '../materials/Material';

export class Grid {
  readonly cols:  number;
  readonly rows:  number;
  readonly cells: Uint8Array;

  constructor(cols: number, rows: number) {
    this.cols  = cols;
    this.rows  = rows;
    this.cells = new Uint8Array(cols * rows);
  }

  index(x: number, y: number): number {
    return y * this.cols + x;
  }

  get(x: number, y: number): MaterialType {
    return this.cells[this.index(x, y)] as MaterialType;
  }

  set(x: number, y: number, material: MaterialType): void {
    this.cells[this.index(x, y)] = material;
  }

  swap(x1: number, y1: number, x2: number, y2: number): void {
    const i1 = this.index(x1, y1);
    const i2 = this.index(x2, y2);
    const tmp      = this.cells[i1];
    this.cells[i1] = this.cells[i2];
    this.cells[i2] = tmp;
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  clear(): void {
    this.cells.fill(MaterialType.Empty);
  }

  countMaterials(): Map<MaterialType, number> {
    const counts = new Map<MaterialType, number>();
    for (let i = 0; i < this.cells.length; i++) {
      const type = this.cells[i] as MaterialType;
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    return counts;
  }
}
