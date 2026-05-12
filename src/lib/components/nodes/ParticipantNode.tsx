import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ParticipantNodeData } from '../../utils/merge';

type ParticipantNodeType = Node<ParticipantNodeData, 'participant'>;

const STEREO_COLORS: Record<string, string> = {
  participant: '#3b82f6',
  database: '#8b5cf6',
  system: '#f59e0b',
  boundary: '#ec4899',
  control: '#10b981',
  entity: '#06b6d4',
};

export function ParticipantNode({ data }: NodeProps<ParticipantNodeType>) {
  const { participant, highlighted, dimmed } = data;
  const accentColor = STEREO_COLORS[participant.stereotype] ?? STEREO_COLORS['participant'];

  const opacity = dimmed ? 0.25 : 1;
  const borderColor = highlighted ? accentColor : '#334155';
  const shadowColor = highlighted ? `${accentColor}66` : 'transparent';
  const bgColor = highlighted ? `${accentColor}18` : '#1e293b';

  return (
    <div
      style={{
        opacity,
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 8,
        padding: '10px 16px',
        minWidth: 140,
        transition: 'all 0.2s ease',
        boxShadow: highlighted ? `0 0 12px ${shadowColor}` : 'none',
        cursor: 'default',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      <div
        style={{
          fontSize: 10,
          color: accentColor,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 4,
          fontFamily: 'monospace',
        }}
      >
        {participant.stereotype !== 'participant' ? `«${participant.stereotype}»` : ''}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#e2e8f0',
          whiteSpace: 'nowrap',
        }}
      >
        {participant.name}
      </div>
      {participant.description && (
        <div
          style={{
            fontSize: 11,
            color: '#64748b',
            marginTop: 4,
            maxWidth: 160,
            whiteSpace: 'normal',
            lineHeight: 1.3,
          }}
        >
          {participant.description}
        </div>
      )}

      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}
