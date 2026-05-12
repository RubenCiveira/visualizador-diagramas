import type { Diagram } from '../types';

interface StepsPanelProps {
  diagram: Diagram | null;
  position: 'left' | 'right';
}

const STEP_TYPE_ICON: Record<string, string> = {
  sync: '→',
  async: '⇢',
  return: '↩',
};

const STEP_TYPE_COLOR: Record<string, string> = {
  sync: '#3b82f6',
  async: '#f59e0b',
  return: '#10b981',
};

export function StepsPanel({ diagram, position }: StepsPanelProps) {
  if (!diagram) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        bottom: 16,
        [position]: 16,
        width: 268,
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
            marginBottom: 4,
          }}
        >
          Steps
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{diagram.name}</div>
        {diagram.description && (
          <div style={{ fontSize: 11, color: '#475569', marginTop: 3, lineHeight: 1.4 }}>
            {diagram.description}
          </div>
        )}
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
        {diagram.steps.map((step) => {
          const icon = STEP_TYPE_ICON[step.type] ?? '→';
          const color = STEP_TYPE_COLOR[step.type] ?? '#3b82f6';

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                gap: 10,
                padding: '8px 16px',
                alignItems: 'flex-start',
              }}
            >
              {/* Step number */}
              <div
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(71, 85, 105, 0.3)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#64748b',
                  marginTop: 1,
                }}
              >
                {step.order}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* from → to */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginBottom: 3,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                    {step.from}
                  </span>
                  <span style={{ fontSize: 12, color, fontWeight: 700 }}>{icon}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                    {step.to}
                  </span>
                </div>

                {/* Label */}
                <div
                  style={{
                    fontSize: 12,
                    color: '#cbd5e1',
                    lineHeight: 1.4,
                  }}
                >
                  {step.label}
                </div>

                {/* Description */}
                {step.description && (
                  <div
                    style={{
                      fontSize: 11,
                      color: '#475569',
                      marginTop: 3,
                      lineHeight: 1.4,
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
