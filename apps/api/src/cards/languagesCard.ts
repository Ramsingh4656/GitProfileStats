import {
  svgDocument,
  icon,
  circle,
  progressBar,
  estimateTextWidth,
  renderTypography,
  resolveTheme,
  computeLayout,
  renderLayout,
  type ContainerNode,
  type LayoutNode,
  type ComputedNode,
} from './engine/index.js';
import type { LanguageCollectionResult } from '../github/language-collector.service.js';

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f1e05a',
  typescript: '#3178c6',
  html: '#e34c26',
  css: '#563d7c',
  python: '#3572a5',
  java: '#b07219',
  'c++': '#f34b7d',
  'c#': '#178600',
  c: '#555555',
  go: '#00add8',
  rust: '#dea584',
  ruby: '#701516',
  php: '#4f5d95',
  shell: '#89e051',
  bash: '#89e051',
  swift: '#f05138',
  kotlin: '#a97bff',
  'objective-c': '#438eff',
  scala: '#c22d40',
  r: '#198ce7',
  dart: '#00b4ab',
  vue: '#41b883',
  jsx: '#61dafb',
  tsx: '#3178c6',
  svelte: '#ff3e00',
  haskell: '#5e5086',
  lua: '#000080',
  perl: '#0298c3',
  clojure: '#db5855',
  elixir: '#6e4a7e',
  erlang: '#b83998',
  ocaml: '#ef7a08',
  'f#': '#b845fc',
  elm: '#60b5cc',
  groovy: '#427819',
  coffeescript: '#244776',
  powershell: '#012456',
  makefile: '#427819',
  cmake: '#da3434',
  dockerfile: '#389d70',
  yaml: '#cb171e',
  json: '#292929',
  markdown: '#083fa1',
  sql: '#e38c00',
  assembly: '#6e4c13',
  julia: '#a270ba',
  zig: '#ec915c',
  nim: '#37775b',
  d: '#ba595e',
  fortran: '#4d41b1',
  matlab: '#e16737',
};

/**
 * Gets a deterministic HSL color for the language if it is not in the predefined map.
 */
export function getLanguageColor(languageName: string): string {
  const normalized = languageName.toLowerCase().trim();
  if (LANGUAGE_COLORS[normalized]) {
    return LANGUAGE_COLORS[normalized];
  }

  // Deterministic HSL color for fallback
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 75%, 50%)`;
}

/**
 * Helper to adjust a hex color by lightening or darkening it.
 */
function adjustColor(hex: string, percent: number): string {
  hex = hex.replace(/^\s*#|\s*$/g, '');
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, '$1$1');
  }
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  const isDark = (r * 299 + g * 587 + b * 114) / 1000 < 128;
  const amount = isDark ? percent : -percent;

  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));

  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Recursively searches a computed layout tree for a node with a specific ID.
 */
function findComputedNodeById(node: ComputedNode, id: string): ComputedNode | undefined {
  if (node.node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findComputedNodeById(child, id);
      if (found) return found;
    }
  }
  return undefined;
}

export interface RenderLanguagesCardOptions {
  langsCount?: number;
  title?: string;
}

/**
 * Renders the Languages Card SVG.
 */
export function renderLanguagesCard(
  languages: LanguageCollectionResult,
  themeName?: string,
  options?: RenderLanguagesCardOptions,
): string {
  const resolvedTheme = resolveTheme(themeName);
  const limit = options?.langsCount ?? 5;
  const titleText = options?.title ?? 'Most Used Languages';

  // Take top languages up to the limit
  const displayedLangs = languages.slice(0, limit);

  // Calculate sum of bytes for the displayed languages (for segment bar normalization)
  const displayedBytesSum = displayedLangs.reduce((sum, lang) => sum + lang.bytes, 0);

  // If there are no languages, show a friendly fallback message
  const hasLanguages = displayedLangs.length > 0;

  // Build the list of language row layout nodes
  const languagesListChildren: LayoutNode[] = hasLanguages
    ? displayedLangs.map((lang) => {
        return {
          type: 'row',
          width: 'fill',
          spacing: 8,
          alignItems: 'center',
          style: {
            className: 'lang-row',
          },
          children: [
            // Left side: Color dot + Language Name
            {
              type: 'row',
              width: 130,
              spacing: 8,
              alignItems: 'center',
              children: [
                {
                  type: 'leaf',
                  width: 8,
                  height: 8,
                  render: (x, y, w, h) =>
                    circle({
                      cx: x + w / 2,
                      cy: y + h / 2,
                      r: w / 2,
                      fill: getLanguageColor(lang.language),
                    }),
                },
                {
                  type: 'leaf',
                  width: 'auto',
                  height: 'auto',
                  measure: () => ({
                    width: estimateTextWidth(lang.language, 13),
                    height: 14,
                  }),
                  render: (x, y) =>
                    renderTypography(
                      {
                        x,
                        y,
                        text: lang.language,
                        dominantBaseline: 'hanging',
                        maxWidth: 110,
                      },
                      13,
                      600,
                      'var(--color-text)',
                    ),
                },
              ],
            },
            // Middle: Progress Bar
            {
              type: 'leaf',
              width: 'fill',
              height: 6,
              render: (x, y, w, h) =>
                progressBar({
                  x,
                  y,
                  width: w,
                  height: h,
                  value: lang.percentage,
                  max: 100,
                  rx: h / 2,
                  ry: h / 2,
                  color: getLanguageColor(lang.language),
                  backgroundColor: 'var(--color-track-bg)',
                }),
            },
            // Right side: Percentage
            {
              type: 'leaf',
              width: 55,
              height: 'auto',
              measure: () => ({
                width: estimateTextWidth(`${lang.percentage.toFixed(1)}%`, 13),
                height: 14,
              }),
              render: (x, y, w) =>
                renderTypography(
                  {
                    x: x + w,
                    y,
                    text: `${lang.percentage.toFixed(1)}%`,
                    dominantBaseline: 'hanging',
                    textAnchor: 'end',
                  },
                  13,
                  400,
                  'var(--color-text-muted)',
                ),
            },
          ],
        };
      })
    : [
        {
          type: 'leaf',
          width: 'fill',
          height: 'fill',
          render: (x, y, w, h) =>
            renderTypography(
              {
                x: x + w / 2,
                y: y + h / 2,
                text: 'No languages detected',
                dominantBaseline: 'middle',
                textAnchor: 'middle',
              },
              14,
              400,
              'var(--color-text-muted)',
            ),
        },
      ];

  // Root column children
  const rootChildren: LayoutNode[] = [
    // Title Row
    {
      type: 'row',
      width: 'fill',
      spacing: 8,
      alignItems: 'center',
      children: [
        {
          type: 'leaf',
          width: 20,
          height: 20,
          render: (x, y, w) =>
            icon({
              name: 'language',
              x,
              y,
              size: w,
              fill: 'var(--color-accent)',
            }),
        },
        {
          type: 'leaf',
          width: 'auto',
          height: 'auto',
          measure: () => ({
            width: estimateTextWidth(titleText, 16),
            height: 18,
          }),
          render: (x, y) =>
            renderTypography(
              {
                x,
                y,
                text: titleText,
                dominantBaseline: 'hanging',
                maxWidth: 420,
              },
              16,
              700,
              'var(--color-accent)',
            ),
        },
      ],
    },
  ];

  if (hasLanguages) {
    // Add combined segmented progress bar
    rootChildren.push({
      id: 'progress-bar-combined',
      type: 'leaf',
      width: 'fill',
      height: 10,
      render: (x, y, w, h) => {
        const rects: string[] = [];
        let currentX = x;
        for (const lang of displayedLangs) {
          const segWidth = displayedBytesSum > 0 ? (lang.bytes / displayedBytesSum) * w : 0;
          if (segWidth > 0) {
            const color = getLanguageColor(lang.language);
            rects.push(
              `<rect x="${currentX}" y="${y}" width="${segWidth}" height="${h}" fill="${color}" />`,
            );
            currentX += segWidth;
          }
        }
        return `
        <g clip-path="url(#progress-clip)">
          ${rects.join('\n          ')}
        </g>
        `;
      },
    });
  }

  // Add the languages list
  rootChildren.push({
    type: 'column',
    width: 'fill',
    height: 'fill',
    spacing: 8,
    children: languagesListChildren,
  });

  const rootNode: ContainerNode = {
    type: 'column',
    width: 490,
    height: 220,
    padding: 20,
    spacing: 16,
    style: {
      rx: 10,
      ry: 10,
      fill: 'url(#card-bg-gradient)',
      stroke: 'var(--color-border)',
      strokeWidth: 1,
      className: 'languages-card',
    },
    children: rootChildren,
  };

  // Compute and Render layout
  const computed = computeLayout(rootNode, 490, 220);
  const layoutContent = renderLayout(computed);

  // Generate dynamic clipPath for the combined progress bar based on computed coordinates
  let clipPathDef = '';
  if (hasLanguages) {
    const combinedBarComputed = findComputedNodeById(computed, 'progress-bar-combined');
    if (combinedBarComputed) {
      const { x, y, width, height } = combinedBarComputed;
      clipPathDef = `
      <clipPath id="progress-clip">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" ry="${height / 2}" />
      </clipPath>
      `;
    }
  }

  // Background Gradient Definition
  const stopColor = adjustColor(resolvedTheme.background, 12);
  const defs = `
  <defs>
    <linearGradient id="card-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${resolvedTheme.background}" />
      <stop offset="100%" stop-color="${stopColor}" />
    </linearGradient>${clipPathDef}
  </defs>
  `;

  // Custom Premium Styles
  const customStyles = `
    .languages-card {
      filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15));
      transition: transform 0.3s ease, filter 0.3s ease;
    }
    .lang-row {
      transition: transform 0.2s ease;
    }
    .lang-row:hover {
      transform: translateX(4px);
    }
  `;

  return svgDocument(
    {
      width: 490,
      height: 220,
      theme: resolvedTheme,
      customStyles,
    },
    [defs, layoutContent],
  );
}
