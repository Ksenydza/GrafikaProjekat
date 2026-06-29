interface Props {
  running:  boolean;
  onToggle: () => void;
  onClear:  () => void;
}

export function Header({ running, onToggle, onClear }: Props) {
  return (
    <header className="app-header">
      <span className="app-header__logo">Material Lab</span>

      <div className="app-header__controls">
        <button className="ctrl-btn" onClick={onToggle}>
          {running ? 'Pause' : 'Play'}
        </button>
        <button className="ctrl-btn" onClick={onClear}>
          Clear
        </button>
      </div>

      <span className="app-header__version">v0.1.0</span>
    </header>
  );
}
