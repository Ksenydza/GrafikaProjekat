import { MATERIAL_DEFINITIONS, type MaterialType } from '../materials/Material';
import { CELL_SIZE } from '../../shared/constants';
import type { Grid } from '../grid/Grid';

export class Renderer {
  private ctx:       CanvasRenderingContext2D;
  private imageData: ImageData;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D rendering context');
    this.ctx       = ctx;
    this.imageData = ctx.createImageData(canvas.width, canvas.height);
  }

  render(grid: Grid): void {
    const { data }      = this.imageData;
    const canvasWidth   = this.imageData.width;

    for (let cellY = 0; cellY < grid.rows; cellY++) {
      const basePixelY = cellY * CELL_SIZE;

      for (let cellX = 0; cellX < grid.cols; cellX++) {
        const type = grid.cells[cellY * grid.cols + cellX] as MaterialType;
        const [r, g, b, a] = MATERIAL_DEFINITIONS[type].color;

        const basePixelX = cellX * CELL_SIZE;

        for (let py = 0; py < CELL_SIZE; py++) {
          const rowOffset = (basePixelY + py) * canvasWidth;
          for (let px = 0; px < CELL_SIZE; px++) {
            const idx    = (rowOffset + basePixelX + px) * 4;
            data[idx]     = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = a;
          }
        }
      }
    }

    this.ctx.putImageData(this.imageData, 0, 0);
  }
}
