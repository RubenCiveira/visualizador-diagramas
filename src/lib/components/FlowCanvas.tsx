import { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { Diagram } from '../types';
import { buildNodesAndEdges, type ParticipantNodeData } from '../utils/merge';
import { ParticipantNode } from './nodes/ParticipantNode';
import { ActorNode } from './nodes/ActorNode';
import type { Node } from '@xyflow/react';


const nodeTypes = {
  participant: ParticipantNode,
  actor: ActorNode,
};

interface FlowCanvasProps {
  diagrams: Diagram[];
  selectedDiagramId: string | null;
}

const HIGHLIGHT_EDGE_COLOR = '#3b82f6';
const DEFAULT_EDGE_COLOR = '#334155';

export function FlowCanvas({ diagrams, selectedDiagramId }: FlowCanvasProps) {
  const { nodes: builtNodes, edges: builtEdges } = useMemo(
    () => buildNodesAndEdges(diagrams),
    [diagrams],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(builtNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(builtEdges);

  // Re-initialise when diagrams change
  useEffect(() => {
    setNodes(builtNodes);
    setEdges(builtEdges);
  }, [builtNodes, builtEdges, setNodes, setEdges]);

  // Apply highlight/dim when selection changes
  useEffect(() => {
    setNodes((prev: Node<ParticipantNodeData>[]) =>
      prev.map((node) => {
        const diagramIds = (node.data.diagramIds ?? []) as string[];
        const inSelected = !selectedDiagramId || diagramIds.includes(selectedDiagramId);
        return {
          ...node,
          data: {
            ...node.data,
            highlighted: selectedDiagramId !== null && inSelected,
            dimmed: selectedDiagramId !== null && !inSelected,
          },
        };
      }),
    );

    setEdges((prev) =>
      prev.map((edge) => {
        const data = edge.data as { diagramIds?: string[] } | undefined;
        const diagramIds = data?.diagramIds ?? [];
        const inSelected = !selectedDiagramId || diagramIds.includes(selectedDiagramId);
        const color =
          selectedDiagramId && inSelected ? HIGHLIGHT_EDGE_COLOR : DEFAULT_EDGE_COLOR;
        const opacity = selectedDiagramId && !inSelected ? 0.08 : 1;

        return {
          ...edge,
          data: edge.data ?? { diagramIds: [] },
          style: {
            stroke: color,
            strokeWidth: selectedDiagramId && inSelected ? 2.5 : 1.5,
            opacity,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color,
          },
        };
      }),
    );
  }, [selectedDiagramId, setNodes, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      style={{ background: '#0f172a' }}
      minZoom={0.3}
      maxZoom={2}
    >
      <Background color="#1e293b" variant={BackgroundVariant.Dots} gap={24} size={1} />
      <Controls
        style={{
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1px solid rgba(71, 85, 105, 0.4)',
          borderRadius: 8,
        }}
      />
    </ReactFlow>
  );
}
