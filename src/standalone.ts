import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { SequenceVisualizer } from './lib/components/SequenceVisualizer';
import { parseMermaidDiagram } from './lib/adapters/MermaidAdapter';
import type { Diagram } from './lib/types';

export interface MountOptions {
  diagramListPosition?: 'left' | 'right';
  stepsPosition?: 'left' | 'right';
  height?: string | number;
}

export interface InlineDiagram {
  /** Unique identifier for the diagram. */
  id: string;
  /** Raw Mermaid content (with optional YAML frontmatter). */
  content: string;
}

export interface VisualizerInstance {
  unmount(): void;
}

type DiagramSource = string | InlineDiagram[];

function render(container: HTMLElement, diagrams: Diagram[], options: MountOptions) {
  const root = createRoot(container);
  root.render(
    createElement(SequenceVisualizer, {
      diagrams,
      height: options.height ?? '100%',
      diagramListPosition: options.diagramListPosition ?? 'right',
      stepsPosition: options.stepsPosition ?? 'left',
    }),
  );
  return { unmount: () => root.unmount() };
}

/**
 * Mount the visualizer into `container`.
 *
 * @param source - Either a URL string (manifest JSON / .mmd / .md file)
 *                 or an array of `{ id, content }` inline Mermaid diagrams.
 *                 Pass an array to work fully offline / from `file://`.
 */
export function mount(
  container: HTMLElement,
  source: DiagramSource,
  options: MountOptions = {},
): VisualizerInstance {
  if (typeof source === 'string') {
    // URL path — delegate loading to the component (requires HTTP)
    const root = createRoot(container);
    root.render(
      createElement(SequenceVisualizer, {
        url: source,
        height: options.height ?? '100%',
        diagramListPosition: options.diagramListPosition ?? 'right',
        stepsPosition: options.stepsPosition ?? 'left',
      }),
    );
    return { unmount: () => root.unmount() };
  }

  // Inline array — parse synchronously, no fetch needed
  const diagrams = source.map((d) => parseMermaidDiagram(d.content, d.id));
  return render(container, diagrams, options);
}

/**
 * Mount the visualizer by reading all `<script type="text/mermaid">` tags
 * present in the document. Each script tag becomes one diagram.
 *
 * Attributes on the tag:
 *   - `data-id`   — diagram id (falls back to index-based id)
 *
 * Example:
 * ```html
 * <script type="text/mermaid" data-id="auth">
 * ---
 * title: User Auth
 * ---
 * sequenceDiagram
 *   actor User
 *   ...
 * </script>
 * ```
 */
export function mountFromScripts(
  container: HTMLElement,
  options: MountOptions = {},
): VisualizerInstance {
  const tags = Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[type="text/mermaid"]'),
  );

  if (tags.length === 0) {
    console.warn('[SequenceFlowVisualizer] No <script type="text/mermaid"> tags found.');
  }

  const inline: InlineDiagram[] = tags.map((tag, i) => ({
    id: tag.dataset['id'] ?? `diagram-${i + 1}`,
    content: tag.textContent ?? '',
  }));

  return mount(container, inline, options);
}
