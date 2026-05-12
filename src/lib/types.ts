export type Stereotype =
  | 'actor'
  | 'participant'
  | 'database'
  | 'system'
  | 'boundary'
  | 'control'
  | 'entity';

export interface Participant {
  id: string;
  name: string;
  stereotype: Stereotype;
  description?: string;
}

export type StepType = 'sync' | 'async' | 'return';

export interface Step {
  id: string;
  order: number;
  from: string;
  to: string;
  label: string;
  description?: string;
  type: StepType;
}

export interface Diagram {
  id: string;
  name: string;
  description?: string;
  participants: Participant[];
  steps: Step[];
}

export interface DiagramAdapter {
  load(url: string): Promise<Diagram[]>;
}

export interface PanelPosition {
  side: 'left' | 'right';
}

export interface SequenceVisualizerProps {
  url: string;
  adapter?: DiagramAdapter;
  diagramListPosition?: 'left' | 'right';
  stepsPosition?: 'left' | 'right';
  height?: string | number;
}
