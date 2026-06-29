import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { SimulationEngine } from '../../core/engine/SimulationEngine';
import type { Brush } from '../../core/tools/Brush';
import { CELL_SIZE, GRID_COLS, GRID_ROWS } from '../../shared/constants';
import type { CellCoord } from '../../shared/types';

interface Props {
  brush:     Brush;
  engineRef: MutableRefObject<SimulationEngine | null>;
}

export function SimulationCanvas({ brush, engineRef }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const isPainting = useRef(false);
  const prevCell   = useRef<CellCoord | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = GRID_COLS * CELL_SIZE;
    canvas.height = GRID_ROWS * CELL_SIZE;

    const engine = new SimulationEngine();
    engine.attachRenderer(canvas);
    engine.render();
    engine.start();
    engineRef.current = engine;

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toCell(canvas: HTMLCanvasElement, clientX: number, clientY: number): CellCoord {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.floor((clientX - rect.left) * scaleX / CELL_SIZE),
      y: Math.floor((clientY - rect.top)  * scaleY / CELL_SIZE),
    };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const cell = toCell(canvas, e.clientX, e.clientY);

    // For dynamic materials, refuse to start a drag when the initial brush
    // position already overlaps Concrete — there is nowhere valid to begin.
    if (!brush.canStartStroke(engine.grid, cell)) return;

    isPainting.current = true;
    prevCell.current   = cell;
    brush.paint(engine.grid, cell);
    engine.render();
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isPainting.current) return;

    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const cell      = toCell(canvas, e.clientX, e.clientY);
    const completed = brush.paintLine(engine.grid, prevCell.current ?? cell, cell);

    if (completed) {
      // Stroke reached its destination — advance the anchor for the next segment.
      prevCell.current = cell;
    } else {
      // Stroke was blocked by Concrete — cancel the entire drag so the next
      // mousemove does not resume painting on the far side of the wall.
      isPainting.current = false;
      prevCell.current   = null;
    }

    engine.render();
  }

  function handleMouseUp() {
    isPainting.current = false;
    prevCell.current   = null;
  }

  function handleMouseLeave() {
    isPainting.current = false;
    prevCell.current   = null;
  }

  return (
    <main className="app-canvas-area">
      <canvas
        ref={canvasRef}
        className="app-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </main>
  );
}
