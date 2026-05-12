import { useState } from 'react';
import { SequenceVisualizer } from '../lib/components/SequenceVisualizer';

type Side = 'left' | 'right';

export function App() {
  const [diagramListPosition, setDiagramListPosition] = useState<Side>('right');
  const [stepsPosition, setStepsPosition] = useState<Side>('left');

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div
        style={{
          background: '#0c1628',
          borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>
          Sequence Flow Visualizer
        </span>

        <div
          style={{
            height: 16,
            width: 1,
            background: 'rgba(71, 85, 105, 0.5)',
            margin: '0 4px',
          }}
        />

        <label style={{ color: '#94a3b8', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          Diagrams panel:
          <select
            value={diagramListPosition}
            onChange={(e) => setDiagramListPosition(e.target.value as Side)}
            style={{
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>

        <label style={{ color: '#94a3b8', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          Steps panel:
          <select
            value={stepsPosition}
            onChange={(e) => setStepsPosition(e.target.value as Side)}
            style={{
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>

        <div style={{ marginLeft: 'auto', color: '#475569', fontSize: 11 }}>
          Select a diagram to highlight its components and steps
        </div>
      </div>

      {/* Visualizer */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <SequenceVisualizer
          url="/sample/manifest.json"
          diagramListPosition={diagramListPosition}
          stepsPosition={stepsPosition}
          height="100%"
        />
      </div>
    </div>
  );
}
