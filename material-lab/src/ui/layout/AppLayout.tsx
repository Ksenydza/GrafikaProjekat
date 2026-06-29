import { useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toolbar } from '../toolbar/Toolbar';
import { RightPanel } from '../panels/RightPanel';
import { SimulationCanvas } from '../components/SimulationCanvas';
import { Brush } from '../../core/tools/Brush';
import type { SimulationEngine } from '../../core/engine/SimulationEngine';
import './AppLayout.css';

export function AppLayout() {
  const brushRef: MutableRefObject<Brush | null> = useRef(null);
  if (!brushRef.current) brushRef.current = new Brush();
  const brush = brushRef.current;

  // Shared ref so Header can call toggle/clear without going through React state.
  const engineRef: MutableRefObject<SimulationEngine | null> = useRef(null);

  // The only simulation-related React state: drives the Pause/Play button label.
  const [running, setRunning] = useState(true);

  function handleToggle() {
    const engine = engineRef.current;
    if (!engine) return;
    engine.toggle();
    setRunning(engine.isRunning());
  }

  function handleClear() {
    engineRef.current?.clear();
  }

  return (
    <div className="app-shell">
      <Header running={running} onToggle={handleToggle} onClear={handleClear} />
      <div className="app-workspace">
        <Toolbar brush={brush} />
        <SimulationCanvas brush={brush} engineRef={engineRef} />
        <RightPanel brush={brush} />
      </div>
      <Footer />
    </div>
  );
}
