import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ParticipantNodeData } from '../../utils/merge';

type ActorNodeType = Node<ParticipantNodeData, 'actor'>;

export function ActorNode({ data }: NodeProps<ActorNodeType>) {
  const { participant, highlighted, dimmed } = data;
  const accentColor = '#f59e0b';

  const opacity = dimmed ? 0.25 : 1;
  const headColor = highlighted ? accentColor : '#94a3b8';
  const textColor = highlighted ? '#e2e8f0' : '#94a3b8';
  const shadowColor = highlighted ? `${accentColor}66` : 'transparent';

  return (
    <div
      style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        transition: 'all 0.2s ease',
        filter: highlighted ? `drop-shadow(0 0 8px ${shadowColor})` : 'none',
        cursor: 'default',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      {/* Actor figure */}
      <svg width="36" height="52" viewBox="0 0 36 52" fill="none">
        {/* Head */}
        <circle cx="18" cy="10" r="8" stroke={headColor} strokeWidth="2" fill="transparent" />
        {/* Body */}
        <line x1="18" y1="18" x2="18" y2="36" stroke={headColor} strokeWidth="2" />
        {/* Arms */}
        <line x1="4" y1="26" x2="32" y2="26" stroke={headColor} strokeWidth="2" />
        {/* Legs */}
        <line x1="18" y1="36" x2="6" y2="50" stroke={headColor} strokeWidth="2" />
        <line x1="18" y1="36" x2="30" y2="50" stroke={headColor} strokeWidth="2" />
      </svg>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: textColor,
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        {participant.name}
      </div>
      {participant.description && (
        <div
          style={{
            fontSize: 11,
            color: '#64748b',
            maxWidth: 120,
            textAlign: 'center',
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
