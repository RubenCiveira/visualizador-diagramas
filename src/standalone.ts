import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { SequenceVisualizer } from './lib/components/SequenceVisualizer';

export interface MountOptions {
  diagramListPosition?: 'left' | 'right';
  stepsPosition?: 'left' | 'right';
  height?: string | number;
}

export interface VisualizerInstance {
  unmount(): void;
}

export function mount(
  container: HTMLElement,
  url: string,
  options: MountOptions = {},
): VisualizerInstance {
  const root = createRoot(container);
  root.render(
    createElement(SequenceVisualizer, {
      url,
      height: options.height ?? '100%',
      diagramListPosition: options.diagramListPosition ?? 'right',
      stepsPosition: options.stepsPosition ?? 'left',
    }),
  );
  return { unmount: () => root.unmount() };
}
