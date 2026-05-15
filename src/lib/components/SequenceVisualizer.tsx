import { useState, useEffect } from 'react';
import type { Diagram, SequenceVisualizerProps } from '../types';
import { MermaidAdapter } from '../adapters/MermaidAdapter';
import { FlowCanvas } from './FlowCanvas';
import { DiagramListPanel } from './DiagramListPanel';
import { StepsPanel } from './StepsPanel';

const defaultAdapter = new MermaidAdapter();

export function SequenceVisualizer({
  url,
  diagrams: propDiagrams,
  adapter,
  diagramListPosition = 'right',
  stepsPosition = 'left',
  height = '100vh',
}: SequenceVisualizerProps) {
  const [diagrams, setDiagrams] = useState<Diagram[]>(propDiagrams ?? []);
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!propDiagrams);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Inline diagrams supplied — no fetch needed
    if (propDiagrams) {
      setDiagrams(propDiagrams);
      setLoading(false);
      setSelectedDiagramId(null);
      return;
    }

    if (!url) return;

    const adapterInstance = adapter ?? defaultAdapter;
    setLoading(true);
    setError(null);
    setSelectedDiagramId(null);

    adapterInstance
      .load(url)
      .then(setDiagrams)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [url, propDiagrams, adapter]);

  const selectedDiagram = diagrams.find((d) => d.id === selectedDiagramId) ?? null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        background: '#0f172a',
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: 14,
          }}
        >
          Loading diagrams…
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600 }}>Failed to load</div>
          <div style={{ color: '#64748b', fontSize: 12, maxWidth: 400, textAlign: 'center' }}>
            {error}
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <FlowCanvas diagrams={diagrams} selectedDiagramId={selectedDiagramId} />
          <DiagramListPanel
            diagrams={diagrams}
            selectedDiagramId={selectedDiagramId}
            onSelect={setSelectedDiagramId}
            position={diagramListPosition}
          />
          <StepsPanel diagram={selectedDiagram} position={stepsPosition} />
        </>
      )}
    </div>
  );
}
