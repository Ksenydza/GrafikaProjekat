import { Grid } from '../grid/Grid';
import { Renderer } from '../rendering/Renderer';
import { updateSand }              from '../physics/SandPhysics';
import { updateWater }             from '../physics/WaterPhysics';
import { updateAcidWaterDilution,
         updateAcid }              from '../physics/AcidPhysics';
import { updateWeakAcid }          from '../physics/WeakAcidPhysics';
import { GRID_COLS, GRID_ROWS }    from '../../shared/constants';

export class SimulationEngine {
  readonly grid: Grid;
  private renderer: Renderer | null = null;
  private running  = false;
  private rafId    = 0;

  constructor() {
    this.grid = new Grid(GRID_COLS, GRID_ROWS);
  }

  attachRenderer(canvas: HTMLCanvasElement): void {
    this.renderer = new Renderer(canvas);
  }

  /** One-shot render — used after paint events and after clear(). */
  render(): void {
    this.renderer?.render(this.grid);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────

  /** Begin the simulation loop (idempotent). */
  start(): void {
    this.resume();
  }

  /** Permanently cancel the loop — call only on component unmount. */
  stop(): void {
    this.pause();
  }

  // ── UI controls ──────────────────────────────────────────────────────

  pause(): void {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  resume(): void {
    if (this.running) return;
    this.running = true;
    this.loop();
  }

  toggle(): void {
    this.running ? this.pause() : this.resume();
  }

  isRunning(): boolean {
    return this.running;
  }

  clear(): void {
    this.grid.clear();
    this.render();
  }

  // ── Internal ─────────────────────────────────────────────────────────

  private loop(): void {
    if (!this.running) return;
    this.tick();
    this.renderer?.render(this.grid);
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  private tick(): void {
    updateSand(this.grid);
    updateWater(this.grid);
    updateAcidWaterDilution(this.grid); // convert all Acid+Water contacts before Acid moves
    updateAcid(this.grid);
    updateWeakAcid(this.grid);
  }
}
