export type CellCoord = { x: number; y: number };

export type RGBA = [number, number, number, number];

export interface SimulationState {
  running: boolean;
  tick:    number;
}
