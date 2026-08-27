import {
  svgDocument,
  icon,
  circle,
  estimateTextWidth,
  renderTypography,
  resolveThemeWithOptions,
  computeLayout,
  renderLayout,
  type ContainerNode,
  type LayoutNode,
  type CardOptions,
} from './engine/index.js';
import type { GitHubRepository } from '../github/github.service.js';
import { getLanguageColor } from './languagesCard.js';

/**
 * Word wraps description text according to estimated character width.
 */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = estimateTextWidth(testLine, fontSize);
    if (testWidth > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
        currentLine = '';
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Formats a timestamp into a standard human readable string.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();

  if (year === currentYear) {
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

/**
 * Renders a premium Repository Card as an SVG string.
 */
export function renderRepositoryCard(repo: GitHubRepository, options?: CardOptions): string {
  const resolvedTheme = resolveThemeWithOptions(options);

  const cardWidth = 450;
  const cardHeight = 150;
  const padding = 20;
  const contentWidth = cardWidth - padding * 2; // 410

  const titleText = repo.name;

  // Forked status subtitle
  const isFork = repo.fork && repo.parent;
  const forkedSubtitleText = isFork ? `forked from ${repo.parent.full_name}` : '';

  // Wrapping description text
  const descriptionText = repo.description || 'No description provided.';
  const wrappedLines = wrapText(descriptionText, contentWidth, 13);
  const maxLines = isFork ? 1 : 2; // Save vertical space if showing fork subtitle
  const displayLines = wrappedLines.slice(0, maxLines);
  if (wrappedLines.length > maxLines) {
    const lastIdx = displayLines.length - 1;
    if (lastIdx >= 0 && displayLines[lastIdx]) {
      displayLines[lastIdx] = displayLines[lastIdx].slice(0, -3) + '...';
    }
  }

  // Footer stats elements
  const footerChildren: LayoutNode[] = [];

  // Primary Language
  if (repo.language) {
    const langColor = getLanguageColor(repo.language);
    footerChildren.push({
      type: 'row',
      spacing: 6,
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
              fill: langColor,
            }),
        },
        {
          type: 'leaf',
          width: 'auto',
          height: 'auto',
          measure: () => ({
            width: estimateTextWidth(repo.language!, 12),
            height: 14,
          }),
          render: (x, y) =>
            renderTypography(
              {
                x,
                y,
                text: repo.language!,
                dominantBaseline: 'hanging',
              },
              12,
              600,
              'var(--color-text-muted)',
            ),
        },
      ],
    });
  }

  // Stars
  if (repo.stargazers_count !== undefined) {
    const starsStr = formatNumber(repo.stargazers_count);
    footerChildren.push({
      type: 'row',
      spacing: 4,
      alignItems: 'center',
      children: [
        {
          type: 'leaf',
          width: 14,
          height: 14,
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
            width: estimateTextWidth(starsStr, 12),
            height: 14,
          }),
          render: (x, y) =>
            renderTypography(
              {
                x,
                y,
                text: starsStr,
                dominantBaseline: 'hanging',
              },
              12,
              500,
              'var(--color-text-muted)',
            ),
        },
      ],
    });
  }

  // Forks
  if (repo.forks_count !== undefined) {
    const forksStr = formatNumber(repo.forks_count);
    footerChildren.push({
      type: 'row',
      spacing: 4,
      alignItems: 'center',
      children: [
        {
          type: 'leaf',
          width: 14,
          height: 14,
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
            width: estimateTextWidth(forksStr, 12),
            height: 14,
          }),
          render: (x, y) =>
            renderTypography(
              {
                x,
                y,
                text: forksStr,
                dominantBaseline: 'hanging',
              },
              12,
              500,
              'var(--color-text-muted)',
            ),
        },
      ],
    });
  }

  // License
  const licenseName = repo.license?.spdx_id || repo.license?.name;
  if (licenseName && licenseName !== 'NOASSERTION') {
    footerChildren.push({
      type: 'row',
      spacing: 4,
      alignItems: 'center',
      children: [
        {
          type: 'leaf',
          width: 14,
          height: 14,
          render: (x, y, w) =>
            icon({
              name: 'law',
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
            width: estimateTextWidth(licenseName, 12),
            height: 14,
          }),
          render: (x, y) =>
            renderTypography(
              {
                x,
                y,
                text: licenseName,
                dominantBaseline: 'hanging',
              },
              12,
              500,
              'var(--color-text-muted)',
            ),
        },
      ],
    });
  }

  // Last Updated
  const updatedStr = `Updated ${formatDate(repo.updated_at)}`;
  footerChildren.push({
    type: 'row',
    spacing: 4,
    alignItems: 'center',
    children: [
      {
        type: 'leaf',
        width: 'auto',
        height: 'auto',
        measure: () => ({
          width: estimateTextWidth(updatedStr, 12),
          height: 14,
        }),
        render: (x, y) =>
          renderTypography(
            {
              x,
              y,
              text: updatedStr,
              dominantBaseline: 'hanging',
            },
            12,
            500,
            'var(--color-text-muted)',
          ),
      },
    ],
  });

  // Layout Nodes List
  const childrenNodes: LayoutNode[] = [];

  // 1. Repo Title Row
  childrenNodes.push({
    type: 'row',
    width: 'fill',
    spacing: 8,
    alignItems: 'center',
    children: [
      {
        type: 'leaf',
        width: 16,
        height: 16,
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
              maxWidth: 380,
            },
            16,
            700,
            'var(--color-accent)',
          ),
      },
    ],
  });

  // 2. Forked status (if applicable)
  if (isFork) {
    childrenNodes.push({
      type: 'leaf',
      width: 'auto',
      height: 'auto',
      measure: () => ({
        width: estimateTextWidth(forkedSubtitleText, 11),
        height: 12,
      }),
      render: (x, y) =>
        renderTypography(
          {
            x,
            y,
            text: forkedSubtitleText,
            dominantBaseline: 'hanging',
            maxWidth: 410,
          },
          11,
          400,
          'var(--color-text-muted)',
        ),
    });
  }

  // 3. Description lines
  const descChildren: LayoutNode[] = displayLines.map((lineText) => ({
    type: 'leaf',
    width: 'auto',
    height: 'auto',
    measure: () => ({
      width: estimateTextWidth(lineText, 13),
      height: 15,
    }),
    render: (x, y) =>
      renderTypography(
        {
          x,
          y,
          text: lineText,
          dominantBaseline: 'hanging',
        },
        13,
        400,
        'var(--color-text)',
      ),
  }));

  childrenNodes.push({
    type: 'column',
    width: 'fill',
    spacing: 4,
    children: descChildren,
  });

  // Flex filler to push stats to the bottom
  childrenNodes.push({
    type: 'leaf',
    width: 'fill',
    height: 'fill',
    render: () => '',
  });

  // 4. Stats Row at bottom
  childrenNodes.push({
    type: 'row',
    width: 'fill',
    spacing: 16,
    alignItems: 'center',
    children: footerChildren,
  });

  const rootNode: ContainerNode = {
    type: 'column',
    width: cardWidth,
    height: cardHeight,
    padding: padding,
    spacing: 8,
    style: {
      rx: options?.borderRadius !== undefined ? options.borderRadius : 10,
      ry: options?.borderRadius !== undefined ? options.borderRadius : 10,
      fill: 'url(#card-bg-gradient)',
      stroke: options?.hideBorder ? 'none' : 'var(--color-border)',
      strokeWidth: options?.hideBorder ? 0 : 1,
      className: 'repository-card',
    },
    children: childrenNodes,
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
    .repository-card {
      filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15));
      transition: transform 0.3s ease, filter 0.3s ease;
    }
    .repository-card:hover {
      transform: translateY(-2px);
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
