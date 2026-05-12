import type { Diagram } from '../types';

interface DiagramListPanelProps {
  diagrams: Diagram[];
  selectedDiagramId: string | null;
  onSelect: (id: string | null) => void;
  position: 'left' | 'right';
}

export function DiagramListPanel({
  diagrams,
  selectedDiagramId,
  onSelect,
  position,
}: DiagramListPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        bottom: 16,
        [position]: 16,
        width: 240,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(71, 85, 105, 0.4)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Diagrams
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
        {diagrams.map((diagram) => {
          const isSelected = diagram.id === selectedDiagramId;
          return (
            <button
              key={diagram.id}
              onClick={() => onSelect(isSelected ? null : diagram.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: 'none',
                borderLeft: `3px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
                padding: '10px 16px 10px 13px',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(71, 85, 105, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? '#e2e8f0' : '#94a3b8',
                  marginBottom: diagram.description ? 3 : 0,
                  transition: 'color 0.15s',
                }}
              >
                {diagram.name}
              </div>
              {diagram.description && (
                <div
                  style={{
                    fontSize: 11,
                    color: '#475569',
                    lineHeight: 1.4,
                  }}
                >
                  {diagram.description}
                </div>
              )}
              <div
                style={{
                  fontSize: 11,
                  color: isSelected ? '#3b82f6' : '#334155',
                  marginTop: 4,
                }}
              >
                {diagram.participants.length} participants · {diagram.steps.length} steps
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
