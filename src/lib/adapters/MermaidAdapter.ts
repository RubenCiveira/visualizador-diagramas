import type { Diagram, DiagramAdapter, Participant, Step, Stereotype } from '../types';

interface ManifestEntry {
  id?: string;
  url: string;
  title?: string;
}

type Manifest = { diagrams: (ManifestEntry | string)[] } | (ManifestEntry | string)[];

function resolveUrl(base: string, relative: string): string {
  if (relative.startsWith('http') || relative.startsWith('//') || relative.startsWith('/')) {
    return relative;
  }
  const parts = base.split('/');
  parts.pop();
  return parts.join('/') + '/' + relative;
}

function parseFrontmatter(content: string): {
  meta: Record<string, string>;
  body: string;
} {
  const fm = content.match(/^\s*---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fm) return { meta: {}, body: content };

  const meta: Record<string, string> = {};
  for (const line of fm[1].split('\n')) {
    const m = line.match(/^(\w+)\s*:\s*(.+)$/);
    if (m) meta[m[1].trim()] = m[2].trim();
  }
  return { meta, body: fm[2] };
}

const ARROW_RE = /^([A-Za-z_][\w]*)\s*(->>|-->>|->|-->|-[xX]|--[xX]|-[)‌]|--[)])\s*([A-Za-z_][\w]*)\s*:\s*(.*)$/;
const PARTICIPANT_RE = /^(participant|actor)\s+([A-Za-z_][\w]*)(?:\s+as\s+(.+))?$/i;
const DESC_RE = /^%%\s*@desc\s+([A-Za-z_][\w]*)\s*:\s*(.+?)%%?$/;
const STEREOTYPE_RE = /^%%\s*@stereotype\s+([A-Za-z_][\w]*)\s*:\s*(\w+)%%?$/;
const TITLE_RE = /^title[\s:]+(.+)$/i;

function arrowType(arrow: string): Step['type'] {
  if (arrow.startsWith('--')) return 'return';
  if (arrow.includes('x') || arrow.includes('X') || arrow.includes(')')) return 'async';
  return 'sync';
}

export function parseMermaidDiagram(
  content: string,
  id: string,
  fallbackTitle?: string,
  fallbackDescription?: string,
): Diagram {
  const { meta, body } = parseFrontmatter(content);

  const participantMap = new Map<string, Participant>();
  const steps: Step[] = [];
  const pendingDescs = new Map<string, string>();
  const pendingStereotypes = new Map<string, Stereotype>();

  let title = meta['title'] ?? fallbackTitle ?? '';
  const description = meta['description'] ?? fallbackDescription ?? '';
  let inDiagram = false;

  for (const raw of body.split('\n')) {
    const line = raw.trim();

    if (/^sequenceDiagram\s*$/i.test(line)) {
      inDiagram = true;
      continue;
    }
    if (!inDiagram) continue;

    // Comments: @desc and @stereotype annotations
    if (line.startsWith('%%')) {
      const descMatch = line.match(DESC_RE);
      if (descMatch) {
        pendingDescs.set(descMatch[1], descMatch[2].trim());
        if (participantMap.has(descMatch[1])) {
          participantMap.get(descMatch[1])!.description = descMatch[2].trim();
        }
      }
      const stereoMatch = line.match(STEREOTYPE_RE);
      if (stereoMatch) {
        const s = stereoMatch[2].toLowerCase() as Stereotype;
        pendingStereotypes.set(stereoMatch[1], s);
        if (participantMap.has(stereoMatch[1])) {
          participantMap.get(stereoMatch[1])!.stereotype = s;
        }
      }
      continue;
    }

    // Title directive
    const titleMatch = line.match(TITLE_RE);
    if (titleMatch) {
      title = titleMatch[1].trim();
      continue;
    }

    // Participant / actor declarations
    const pMatch = line.match(PARTICIPANT_RE);
    if (pMatch) {
      const [, keyword, pid, alias] = pMatch;
      const stereotype: Stereotype = keyword.toLowerCase() === 'actor' ? 'actor' : 'participant';
      const overrideStereotype = pendingStereotypes.get(pid);
      participantMap.set(pid, {
        id: pid,
        name: alias?.trim() ?? pid,
        stereotype: overrideStereotype ?? stereotype,
        description: pendingDescs.get(pid),
      });
      continue;
    }

    // Messages
    const msgMatch = line.match(ARROW_RE);
    if (msgMatch) {
      const [, from, arrow, to, label] = msgMatch;

      for (const pid of [from, to]) {
        if (!participantMap.has(pid)) {
          participantMap.set(pid, {
            id: pid,
            name: pid,
            stereotype: pendingStereotypes.get(pid) ?? 'participant',
            description: pendingDescs.get(pid),
          });
        }
      }

      steps.push({
        id: `${id}-step-${steps.length}`,
        order: steps.length + 1,
        from,
        to,
        label: label.trim(),
        type: arrowType(arrow),
      });
    }
  }

  return {
    id,
    name: title || id,
    description: description || undefined,
    participants: Array.from(participantMap.values()),
    steps,
  };
}

// ---------------------------------------------------------------------------
// Markdown extractor — finds all ```mermaid sequenceDiagram blocks
// ---------------------------------------------------------------------------

interface MarkdownBlock {
  code: string;
  heading: string;
  description: string;
}

function extractMermaidBlocks(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = markdown.split('\n');

  let currentHeading = '';
  let currentDescription = '';
  let collectingDesc = false;
  let inFence = false;
  let fenceLang = '';
  let fenceLines: string[] = [];

  for (const line of lines) {
    if (!inFence) {
      const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
      if (headingMatch) {
        currentHeading = headingMatch[1].trim();
        currentDescription = '';
        collectingDesc = true;
        continue;
      }

      const fenceStart = line.match(/^```(\w*)/);
      if (fenceStart) {
        fenceLang = fenceStart[1].toLowerCase();
        inFence = true;
        fenceLines = [];
        collectingDesc = false;
        continue;
      }

      // Accumulate plain-text paragraph as description for the next diagram
      if (collectingDesc && line.trim() !== '') {
        currentDescription += (currentDescription ? ' ' : '') + line.trim();
      } else if (collectingDesc && line.trim() === '' && currentDescription) {
        collectingDesc = false;
      }
    } else {
      if (line.trimEnd() === '```') {
        inFence = false;
        if (fenceLang === 'mermaid') {
          const code = fenceLines.join('\n');
          if (/sequenceDiagram/i.test(code)) {
            blocks.push({ code, heading: currentHeading, description: currentDescription });
          }
        }
        fenceLines = [];
        fenceLang = '';
      } else {
        fenceLines.push(line);
      }
    }
  }

  return blocks;
}

function parseMarkdownFile(content: string, baseId: string): Diagram[] {
  const blocks = extractMermaidBlocks(content);
  return blocks.map((block, idx) => {
    const id = blocks.length === 1 ? baseId : `${baseId}-${idx + 1}`;
    return parseMermaidDiagram(block.code, id, block.heading || undefined, block.description || undefined);
  });
}

// ---------------------------------------------------------------------------

export class MermaidAdapter implements DiagramAdapter {
  async load(url: string): Promise<Diagram[]> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

    if (url.endsWith('.mmd')) {
      const text = await res.text();
      const id = url.split('/').pop()?.replace(/\.\w+$/, '') ?? 'diagram';
      return [parseMermaidDiagram(text, id)];
    }

    if (url.endsWith('.md')) {
      const text = await res.text();
      const baseId = url.split('/').pop()?.replace(/\.\w+$/, '') ?? 'diagram';
      return parseMarkdownFile(text, baseId);
    }

    // Treat as manifest JSON
    const manifest: Manifest = await res.json();
    const entries: ManifestEntry[] = (Array.isArray(manifest) ? manifest : manifest.diagrams).map(
      (e) => (typeof e === 'string' ? { url: e } : e),
    );

    const diagrams = (
      await Promise.all(
        entries.map(async (entry, idx) => {
          const diagramUrl = resolveUrl(url, entry.url);
          const r = await fetch(diagramUrl);
          if (!r.ok) throw new Error(`Failed to fetch ${diagramUrl}: ${r.status}`);
          const text = await r.text();
          const baseId =
            entry.id ?? entry.url.split('/').pop()?.replace(/\.\w+$/, '') ?? `diagram-${idx}`;

          if (diagramUrl.endsWith('.md')) {
            return parseMarkdownFile(text, baseId);
          }
          return [parseMermaidDiagram(text, baseId)];
        }),
      )
    ).flat();

    return diagrams;
  }
}
