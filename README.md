# Sequence Flow Visualizer

Interactive visualizer for sequence diagrams built with React Flow. Merges multiple sequence diagrams into a single graph — shared components appear once with relationships from all diagrams. Selecting a diagram highlights its participants and steps.

## Features

- **Merged graph** — participants shared across diagrams appear once; edges accumulate from all diagrams
- **Diagram list panel** — click a diagram to highlight its nodes and edges, dimming the rest
- **Steps panel** — shows the ordered steps of the selected diagram
- **Configurable panel positions** — both panels can be placed on the left or right at runtime
- **Adapter pattern** — pluggable loader interface; ships with a Mermaid adapter
- **Actor stereotype** — actors render as stick figures; other stereotypes render as labeled boxes

## Quick start

```bash
pnpm install
pnpm dev
```

Then open http://localhost:5173. The demo loads diagrams from `sample/manifest.json`.

## Usage as a library

```tsx
import { SequenceVisualizer } from './src/lib';

<SequenceVisualizer
  url="/sample/manifest.json"
  diagramListPosition="right"   // default
  stepsPosition="left"          // default
  height="100vh"                // default
/>
```

With a custom adapter:

```tsx
import { SequenceVisualizer, MermaidAdapter } from './src/lib';

const adapter = new MermaidAdapter();

<SequenceVisualizer url="/diagrams/manifest.json" adapter={adapter} />
```

## Mermaid diagram format

Files use standard Mermaid sequence diagram syntax with optional YAML frontmatter for metadata.

```
---
title: User Authentication
description: How users log in and receive a session token
---
sequenceDiagram
    %% @desc AuthService: Handles login and token issuance
    %% @stereotype UserDB: database
    actor User
    participant AuthService as Auth Service
    participant UserDB as User Database

    User->>AuthService: POST /login (email, password)
    AuthService->>UserDB: SELECT user WHERE email = ?
    UserDB-->>AuthService: User record
    AuthService-->>User: 200 OK { token }
```

### Frontmatter fields

| Field         | Description                          |
|---------------|--------------------------------------|
| `title`       | Display name of the diagram          |
| `description` | Short description shown in the panel |

### Comment annotations

| Annotation                        | Effect                                              |
|-----------------------------------|-----------------------------------------------------|
| `%% @desc <id>: <text>`           | Description shown below the participant's name      |
| `%% @stereotype <id>: <type>`     | Override stereotype (`actor`, `database`, `system`, `boundary`, `control`, `entity`) |

### Supported arrow types

| Syntax  | Type    |
|---------|---------|
| `->>`   | Sync    |
| `-->>`  | Return  |
| `-x`    | Async   |

## Manifest format

The URL passed to `SequenceVisualizer` can point to a single `.mmd` file or a JSON manifest listing multiple diagrams:

```json
{
  "diagrams": [
    { "id": "user-auth",   "url": "01-user-auth.mmd" },
    { "id": "checkout",    "url": "03-checkout.mmd" }
  ]
}
```

Diagram URLs are resolved relative to the manifest file. The `id` field is optional; the filename is used as fallback.

## Adding a new adapter

Implement the `DiagramAdapter` interface:

```ts
import type { DiagramAdapter, Diagram } from './src/lib/types';

export class PlantUmlAdapter implements DiagramAdapter {
  async load(url: string): Promise<Diagram[]> {
    // fetch and parse your diagrams
    return [];
  }
}
```

Pass it via the `adapter` prop — no other changes needed.

## Project structure

```
src/lib/
  types.ts                      # Stereotype, Participant, Step, Diagram, DiagramAdapter
  index.ts                      # public exports
  adapters/MermaidAdapter.ts    # Mermaid parser + manifest loader
  components/
    SequenceVisualizer.tsx      # root component
    FlowCanvas.tsx              # React Flow canvas
    DiagramListPanel.tsx        # diagram list panel
    StepsPanel.tsx              # steps panel
    nodes/ParticipantNode.tsx   # box node (all stereotypes except actor)
    nodes/ActorNode.tsx         # stick-figure node
  utils/merge.ts                # deduplicates participants and edges across diagrams

sample/                         # example Mermaid diagrams
  manifest.json
  01-user-auth.mmd
  02-user-registration.mmd
  03-checkout.mmd
  04-order-processing.mmd
```

## Building the library

```bash
pnpm build:lib   # outputs to dist/
```

Peer dependencies (`react`, `react-dom`, `@xyflow/react`) are excluded from the bundle.
