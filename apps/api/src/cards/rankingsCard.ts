import {
  svgDocument,
  icon,
  estimateTextWidth,
  renderTypography,
  resolveThemeWithOptions,
  computeLayout,
  renderLayout,
  type ContainerNode,
  type LayoutNode,
  type CardOptions,
  type IconName,
} from './engine/index.js';
import type { IRankedRepository } from '../github/repository-ranking.service.js';

export interface IRankingsCardData {
  username: string;
  name: string | null;
  mostStarred: IRankedRepository | null;
  mostForked: IRankedRepository | null;
  mostRecentlyUpdated: IRankedRepository | null;
}

/**
 * Word wraps description text according to estimated character width.
 */
function truncateText(text: string, maxWidth: number, fontSize: number): string {
  if (!text) return '';
  const testWidth = estimateTextWidth(text, fontSize);
  if (testWidth <= maxWidth) return text;

  // Simple truncation that fits
  let current = text;
  while (current.length > 0 && estimateTextWidth(current + '...', fontSize) > maxWidth) {
    current = current.slice(0, -1);
  }
  return current + '...';
}

/**
 * Formats a timestamp into a standard human readable string.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = months[date.getMonth()] ?? '';
  const day = date.getDate().toString();
  const year = date.getFullYear().toString();
  const currentYear = new Date().getFullYear();

  if (date.getFullYear() === currentYear) {
    return `${month} ${day}`;
  }
  return `${month} ${day}, ${year}`;
}

/**
 * Formats numbers compactly (e.g. 1.2k).
 */
function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return num.toString();
}

/**
 * Adjusts a hex color by lightening or darkening it.
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

function createRankingRow(
  categoryLabel: string,
  iconName: IconName,
  repo: IRankedRepository | null,
  accentColor: string,
  statType: 'stars' | 'forks' | 'date',
): LayoutNode {
  const contentWidth = 290;
  const repoName = repo ? repo.name : 'No repository found';
  const descText = repo ? (repo.description ?? 'No description provided.') : 'No repository meets this highlight criteria.';

  // Truncate description to fit center column width
  const truncatedDesc = truncateText(descText, contentWidth, 11);

  // Stat node
  const statChildren: LayoutNode[] = [];
  if (repo) {
    if (statType === 'stars') {
      const starsStr = formatNumber(repo.stars);
      statChildren.push(
        {
          type: 'leaf',
          width: 12,
          height: 12,
          render: (x, y, w) =>
            icon({
              name: 'star',
              x,
              y,
              size: w,
              fill: 'var(--color-text-muted)',
            }),
        },
        {
          type: 'leaf',
          width: 'auto',
          height: 'auto',
          measure: () => ({
            width: estimateTextWidth(starsStr, 11),
            height: 12,
          }),
          render: (x, y) =>
            renderTypography(
              {
                x,
                y,
                text: starsStr,
                dominantBaseline: 'hanging',
              },
              11,
              600,
              'var(--color-text-muted)',
            ),
        },
      );
    } else if (statType === 'forks') {
      const forksStr = formatNumber(repo.forks);
      statChildren.push(
        {
          type: 'leaf',
          width: 12,
          height: 12,
          render: (x, y, w) =>
            icon({
              name: 'fork',
              x,
              y,
              size: w,
              fill: 'var(--color-text-muted)',
            }),
        },
        {
          type: 'leaf',
          width: 'auto',
          height: 'auto',
          measure: () => ({
            width: estimateTextWidth(forksStr, 11),
            height: 12,
          }),
          render: (x, y) =>
            renderTypography(
              {
                x,
                y,
                text: forksStr,
                dominantBaseline: 'hanging',
              },
              11,
              600,
              'var(--color-text-muted)',
            ),
        },
      );
    } else {
      const dateStr = formatDate(repo.updatedAt);
      statChildren.push(
        {
          type: 'leaf',
          width: 12,
          height: 12,
          render: (x, y, w) =>
            icon({
              name: 'calendar',
              x,
              y,
              size: w,
              fill: 'var(--color-text-muted)',
            }),
        },
        {
          type: 'leaf',
          width: 'auto',
          height: 'auto',
          measure: () => ({
            width: estimateTextWidth(dateStr, 11),
            height: 12,
          }),
          render: (x, y) =>
            renderTypography(
              {
                x,
                y,
                text: dateStr,
                dominantBaseline: 'hanging',
              },
              11,
              600,
              'var(--color-text-muted)',
            ),
        },
      );
    }
  } else {
    statChildren.push({
      type: 'leaf',
      width: 'auto',
      height: 'auto',
      measure: () => ({
        width: estimateTextWidth('-', 11),
        height: 12,
      }),
      render: (x, y) =>
        renderTypography(
          {
            x,
            y,
            text: '-',
            dominantBaseline: 'hanging',
          },
          11,
          500,
          'var(--color-text-muted)',
        ),
    });
  }

  return {
    type: 'row',
    width: 'fill',
    height: 52,
    padding: 8,
    spacing: 12,
    alignItems: 'center',
    style: {
      rx: 8,
      ry: 8,
      fill: 'rgba(255, 255, 255, 0.02)',
      stroke: 'var(--color-border)',
      strokeWidth: 1,
      className: 'ranking-row-item',
    },
    children: [
      // Left Icon Badge
      {
        type: 'leaf',
        width: 32,
        height: 32,
        render: (x, y, w) => {
          const rx = 6;
          const iconSize = 16;
          const offset = (w - iconSize) / 2;
          const xs = x.toString();
          const ys = y.toString();
          const ws = w.toString();
          const rxs = rx.toString();
          return `
            <rect x="${xs}" y="${ys}" width="${ws}" height="${ws}" rx="${rxs}" ry="${rxs}" fill="${accentColor}15" stroke="${accentColor}30" stroke-width="1" />
            ${icon({
              name: iconName,
              x: x + offset,
              y: y + offset,
              size: iconSize,
              fill: accentColor,
            })}
          `;
        },
      },
      // Center Content Column (Category + Name & Description)
      {
        type: 'column',
        width: 'fill',
        spacing: 2,
        children: [
          // Header Row inside content: e.g. "MOST STARRED · Hello-World"
          {
            type: 'row',
            width: 'fill',
            spacing: 6,
            alignItems: 'center',
            children: [
              {
                type: 'leaf',
                width: 'auto',
                height: 'auto',
                measure: () => ({
                  width: estimateTextWidth(categoryLabel, 10),
                  height: 12,
                }),
                render: (x, y) =>
                  renderTypography(
                    {
                      x,
                      y,
                      text: categoryLabel,
                      dominantBaseline: 'hanging',
                    },
                    10,
                    800,
                    accentColor,
                  ),
              },
              {
                type: 'leaf',
                width: 'auto',
                height: 'auto',
                measure: () => ({
                  width: estimateTextWidth('·', 10),
                  height: 12,
                }),
                render: (x, y) =>
                  renderTypography(
                    {
                      x,
                      y,
                      text: '·',
                      dominantBaseline: 'hanging',
                    },
                    10,
                    600,
                    'var(--color-text-muted)',
                  ),
              },
              {
                type: 'leaf',
                width: 'auto',
                height: 'auto',
                measure: () => ({
                  width: estimateTextWidth(repoName, 13),
                  height: 14,
                }),
                render: (x, y) =>
                  renderTypography(
                    {
                      x,
                      y,
                      text: repoName,
                      dominantBaseline: 'hanging',
                      maxWidth: 180,
                    },
                    13,
                    700,
                    'var(--color-text)',
                  ),
              },
            ],
          },
          // Description Line
          {
            type: 'leaf',
            width: 'auto',
            height: 'auto',
            measure: () => ({
              width: estimateTextWidth(truncatedDesc, 11),
              height: 13,
            }),
            render: (x, y) =>
              renderTypography(
                {
                  x,
                  y,
                  text: truncatedDesc,
                  dominantBaseline: 'hanging',
                  maxWidth: contentWidth,
                },
                11,
                400,
                'var(--color-text-muted)',
              ),
          },
        ],
      },
      // Right Stat Block
      {
        type: 'row',
        width: 80,
        spacing: 4,
        alignItems: 'center',
        justifyContent: 'end',
        children: statChildren,
      },
    ],
  };
}

export function renderRankingsCard(data: IRankingsCardData, options?: CardOptions): string {
  const resolvedTheme = resolveThemeWithOptions(options);
  const titleText = `${data.name ?? data.username}'s Repository Rankings`;

  const cardWidth = 490;
  const cardHeight = 240;

  const rootNode: ContainerNode = {
    type: 'column',
    width: cardWidth,
    height: cardHeight,
    padding: 20,
    spacing: 14,
    style: {
      rx: options?.borderRadius ?? 10,
      ry: options?.borderRadius ?? 10,
      fill: 'url(#card-bg-gradient)',
      stroke: options?.hideBorder ? 'none' : 'var(--color-border)',
      strokeWidth: options?.hideBorder ? 0 : 1,
      className: 'rankings-card',
    },
    children: [
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
                name: 'repo',
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
                  maxWidth: 410,
                },
                16,
                700,
                'var(--color-accent)',
              ),
          },
        ],
      },
      // Rankings Stack
      {
        type: 'column',
        width: 'fill',
        spacing: 10,
        children: [
          createRankingRow('MOST STARRED', 'star', data.mostStarred, '#ffd700', 'stars'),
          createRankingRow('MOST FORKED', 'fork', data.mostForked, 'var(--color-accent)', 'forks'),
          createRankingRow('RECENTLY UPDATED', 'calendar', data.mostRecentlyUpdated, '#00e5ff', 'date'),
        ],
      },
    ],
  };

  const computed = computeLayout(rootNode, cardWidth, cardHeight);
  const layoutContent = renderLayout(computed);

  const stopColor = adjustColor(resolvedTheme.background, 12);
  const defs = `
  <defs>
    <linearGradient id="card-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${resolvedTheme.background}" />
      <stop offset="100%" stop-color="${stopColor}" />
    </linearGradient>
  </defs>
  `;

  const customStyles = `
    .rankings-card {
      filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15));
      transition: transform 0.3s ease, filter 0.3s ease;
    }
    .ranking-row-item {
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .ranking-row-item:hover {
      transform: translateX(2px);
      border-color: var(--color-accent);
    }
  `;

  return svgDocument(
    {
      width: cardWidth,
      height: cardHeight,
      theme: resolvedTheme,
      customStyles,
    },
    [defs, layoutContent],
  );
}
