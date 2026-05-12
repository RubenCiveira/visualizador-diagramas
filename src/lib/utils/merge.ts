import type { Node, Edge } from '@xyflow/react';
import type { Diagram, Participant } from '../types';

export interface ParticipantNodeData extends Record<string, unknown> {
  participant: Participant;
  diagramIds: string[];
  highlighted: boolean;
  dimmed: boolean;
  label: string;
}

export interface RelationEdgeData extends Record<string, unknown> {
  diagramIds: string[];
}

const NODE_SPACING_X = 220;
const NODE_SPACING_Y = 160;
const COLS_MAX = 6;

function computeLayout(count: number): { x: number; y: number }[] {
  const cols = Math.min(count, COLS_MAX);
  const rows = Math.ceil(count / cols);
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rowCount = row < rows - 1 ? cols : count - row * cols;
    const rowOffset = ((cols - rowCount) * NODE_SPACING_X) / 2;
    positions.push({
      x: col * NODE_SPACING_X + rowOffset,
      y: row * NODE_SPACING_Y,
    });
  }
  return positions;
}

export function buildNodesAndEdges(diagrams: Diagram[]): {
  nodes: Node<ParticipantNodeData>[];
  edges: Edge<RelationEdgeData>[];
} {
  const participantMap = new Map<string, { participant: Participant; diagramIds: string[] }>();
  const edgeMap = new Map<string, { from: string; to: string; diagramIds: string[] }>();

  for (const diagram of diagrams) {
    for (const p of diagram.participants) {
      if (!participantMap.has(p.id)) {
        participantMap.set(p.id, { participant: p, diagramIds: [] });
      }
      participantMap.get(p.id)!.diagramIds.push(diagram.id);
    }

    const seenEdges = new Set<string>();
    for (const step of diagram.steps) {
      if (step.from === step.to) continue;
      const key = `${step.from}→${step.to}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, { from: step.from, to: step.to, diagramIds: [] });
      }
      if (!seenEdges.has(key + diagram.id)) {
        edgeMap.get(key)!.diagramIds.push(diagram.id);
        seenEdges.add(key + diagram.id);
      }
    }
  }

  const participantList = Array.from(participantMap.values());
  const positions = computeLayout(participantList.length);

  const nodes: Node<ParticipantNodeData>[] = participantList.map((item, idx) => ({
    id: item.participant.id,
    type: item.participant.stereotype === 'actor' ? 'actor' : 'participant',
    position: positions[idx],
    data: {
      participant: item.participant,
      diagramIds: item.diagramIds,
      highlighted: false,
      dimmed: false,
      label: item.participant.name,
    },
  }));

  const edges: Edge<RelationEdgeData>[] = Array.from(edgeMap.values()).map((item) => ({
    id: `edge-${item.from}→${item.to}`,
    source: item.from,
    target: item.to,
    type: 'smoothstep',
    data: { diagramIds: item.diagramIds },
    style: { stroke: '#475569', strokeWidth: 1.5 },
    markerEnd: { type: 'arrowclosed' as const, color: '#475569' },
  }));

  return { nodes, edges };
}
