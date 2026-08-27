import {
  svgDocument,
  icon,
  progressBar,
  estimateTextWidth,
  renderTypography,
  resolveThemeWithOptions,
  computeLayout,
  renderLayout,
  type ContainerNode,
  type LayoutNode,
  type CardOptions,
} from './engine/index.js';
import type { IContributedRepo } from '../github/contributed-repos.service.js';
import { getLanguageColor } from './languagesCard.js';

/**
 * Truncates repository name to fit layout if too long.
 */
function truncateRepoName(owner: string, name: string, maxLen = 22): string {
  const full = `${owner}/${name}`;
  if (full.length <= maxLen) return full;
  return full.slice(0, maxLen - 3) + '...';
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

export interface RenderTopContributedCardOptions extends CardOptions {
  limit?: number;
  title?: string;
}

/**
 * Renders the Top Contributed Repos Card SVG.
 */
export function renderTopContributedCard(
  repos: IContributedRepo[],
  options?: RenderTopContributedCardOptions,
): string {
  const resolvedTheme = resolveThemeWithOptions(options);
  const limit = options?.limit !== undefined ? Math.min(10, Math.max(1, options.limit)) : 5;
  const titleText = options?.title ?? 'Top Contributed Repositories';

  const displayedRepos = repos.slice(0, limit);
  const hasRepos = displayedRepos.length > 0;

  // Highest contribution count for progress bar normalization
  const maxCount = hasRepos ? Math.max(...displayedRepos.map((r) => r.contributionCount)) : 0;

  // Calculate card height dynamically based on the limit
  const cardWidth = 490;
  const cardHeight = 65 + limit * 26;

  // Build the list of repository row nodes
  const reposListChildren: LayoutNode[] = hasRepos
    ? displayedRepos.map((repo, idx) => {
        const truncatedName = truncateRepoName(repo.owner, repo.name, 22);
        const rankText = `#${(idx + 1).toString()}`;
        const commitText = `${repo.contributionCount.toLocaleString()} ${repo.contributionCount === 1 ? 'commit' : 'commits'}`;
        const langColor = repo.primaryLanguage
          ? getLanguageColor(repo.primaryLanguage.name)
          : '#8b949e';

        return {
          type: 'row',
          width: 'fill',
          spacing: 8,
          alignItems: 'center',
          style: {
            className: 'repo-row',
          },
          children: [
            // Rank Badge/Text
            {
              type: 'leaf',
              width: 24,
              height: 'auto',
              measure: () => ({
                width: estimateTextWidth(rankText, 11),
                height: 12,
              }),
              render: (x, y) =>
                renderTypography(
                  {
                    x,
                    y,
                    text: rankText,
                    dominantBaseline: 'hanging',
                  },
                  11,
                  700,
                  'var(--color-text-muted)',
                ),
            },
            // Repository Owner/Name
            {
              type: 'leaf',
              width: 155,
              height: 'auto',
              measure: () => ({
                width: estimateTextWidth(truncatedName, 13),
                height: 14,
              }),
              render: (x, y) =>
                renderTypography(
                  {
                    x,
                    y,
                    text: truncatedName,
                    dominantBaseline: 'hanging',
                    maxWidth: 155,
                  },
                  13,
                  600,
                  'var(--color-text)',
                ),
            },
            // Relative Progress Bar
            {
              type: 'leaf',
              width: 'fill',
              height: 5,
              render: (x, y, w, h) =>
                progressBar({
                  x,
                  y,
                  width: w,
                  height: h,
                  value: repo.contributionCount,
                  max: maxCount || 1,
                  rx: h / 2,
                  ry: h / 2,
                  color: langColor,
                  backgroundColor: 'var(--color-track-bg)',
                }),
            },
            // Commits count
            {
              type: 'leaf',
              width: 80,
              height: 'auto',
              measure: () => ({
                width: estimateTextWidth(commitText, 12),
                height: 14,
              }),
              render: (x, y, w) =>
                renderTypography(
                  {
                    x: x + w,
                    y,
                    text: commitText,
                    dominantBaseline: 'hanging',
                    textAnchor: 'end',
                  },
                  12,
                  400,
                  'var(--color-text-muted)',
                ),
            },
          ],
        };
      })
    : [
        {
          type: 'column',
          width: 'fill',
          height: 'fill',
          spacing: 8,
          alignItems: 'center',
          justifyContent: 'center',
          children: [
            {
              type: 'leaf',
              width: 24,
              height: 24,
              render: (x, y, w) =>
                icon({
                  name: 'repo',
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
                width: estimateTextWidth('No contributions detected', 14),
                height: 16,
              }),
              render: (x, y, w) =>
                renderTypography(
                  {
                    x: x + w / 2,
                    y,
                    text: 'No contributions detected',
                    dominantBaseline: 'hanging',
                    textAnchor: 'middle',
                  },
                  14,
                  600,
                  'var(--color-text-muted)',
                ),
            },
            {
              type: 'leaf',
              width: 'auto',
              height: 'auto',
              measure: () => ({
                width: estimateTextWidth('Contributions to public/private repositories will show up here.', 11),
                height: 12,
              }),
              render: (x, y, w) =>
                renderTypography(
                  {
                    x: x + w / 2,
                    y,
                    text: 'Contributions to public/private repositories will show up here.',
                    dominantBaseline: 'hanging',
                    textAnchor: 'middle',
                  },
                  11,
                  400,
                  'var(--color-text-muted)',
                ),
            },
          ],
        },
      ];

  const rootChildren: LayoutNode[] = [
    // Header Title
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
                maxWidth: 420,
              },
              16,
              700,
              'var(--color-accent)',
            ),
        },
      ],
    },
    // Repos List
    {
      type: 'column',
      width: 'fill',
      height: 'fill',
      spacing: 6,
      children: reposListChildren,
    },
  ];

  const rootNode: ContainerNode = {
    type: 'column',
    width: cardWidth,
    height: cardHeight,
    padding: { top: 16, right: 20, bottom: 16, left: 20 },
    spacing: 12,
    style: {
      rx: options?.borderRadius !== undefined ? options.borderRadius : 10,
      ry: options?.borderRadius !== undefined ? options.borderRadius : 10,
      fill: 'url(#card-bg-gradient)',
      stroke: options?.hideBorder ? 'none' : 'var(--color-border)',
      strokeWidth: options?.hideBorder ? 0 : 1,
      className: 'top-contributed-card',
    },
    children: rootChildren,
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
    .top-contributed-card {
      filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15));
      transition: transform 0.3s ease, filter 0.3s ease;
    }
    .repo-row {
      transition: transform 0.2s ease;
    }
    .repo-row:hover {
      transform: translateX(4px);
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
