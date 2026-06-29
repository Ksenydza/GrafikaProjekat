import { useState } from 'react';
import type { Brush } from '../../core/tools/Brush';
import { clamp } from '../../shared/utils';

interface Props {
  brush: Brush;
}

export function Toolbar({ brush }: Props) {
  const [size, setSize] = useState(brush.size);

  function changeSize(delta: number) {
    const next = clamp(brush.size + delta, 1, 20);
    brush.size = next;
    setSize(next);
  }

  return (
    <aside className="app-toolbar">
      <button className="tool-btn" onClick={() => changeSize(1)}  title="Increase brush size">+</button>
      <span   className="tool-size">{size}</span>
      <button className="tool-btn" onClick={() => changeSize(-1)} title="Decrease brush size">−</button>
    </aside>
  );
}
