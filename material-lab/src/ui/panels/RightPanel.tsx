import type { Brush } from '../../core/tools/Brush';
import { MaterialType } from '../../core/materials/Material';

interface Props {
  brush: Brush;
}

const PALETTE: { label: string; type: MaterialType }[] = [
  { label: 'Sand',     type: MaterialType.Sand      },
  { label: 'Water',    type: MaterialType.Water     },
  { label: 'Concrete', type: MaterialType.Concrete  },
  { label: 'Acid',     type: MaterialType.Acid      },
  { label: 'Erase',    type: MaterialType.Empty     },
];

export function RightPanel({ brush }: Props) {
  return (
    <aside className="app-panel">
      {PALETTE.map(({ label, type }) => (
        <button
          key={label}
          className="palette-btn"
          onClick={() => { brush.materialType = type; }}
        >
          {label}
        </button>
      ))}
    </aside>
  );
}
