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
  type IconName,
  type CardOptions,
} from './engine/index.js';
import type { IContributionStats } from '../github/contribution.service.js';

/**
 * Adjusts a hex color by lightening or darkening it, depending on whether it is light or dark.
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
 * Creates a layout node for a streak metric block.
 */
function createStreakStatBlock(
  iconName: IconName,
  value: number | string,
  label: string,
  isHighlighted = false,
): LayoutNode {
  const valueStr = typeof value === 'number' ? value.toLocaleString() : value;
  const primaryColor = isHighlighted ? '#ff5a00' : 'var(--color-text)';
  const iconColor = isHighlighted ? '#ff5a00' : 'var(--color-accent)';

  return {
    type: 'column',
    width: 'fill',
    height: 'fill',
    padding: 12,
    spacing: 8,
    alignItems: 'center',
    style: {
      rx: 8,
      ry: 8,
      fill: isHighlighted ? 'rgba(255, 90, 0, 0.06)' : 'rgba(255, 255, 255, 0.03)',
      stroke: isHighlighted ? 'rgba(255, 90, 0, 0.3)' : 'var(--color-border)',
      strokeWidth: isHighlighted ? 1.5 : 1,
      className: isHighlighted ? 'streak-block active' : 'streak-block',
    },
    children: [
      // Icon
      {
        type: 'leaf',
        width: isHighlighted ? 26 : 22,
        height: isHighlighted ? 26 : 22,
        render: (x, y, w, h) =>
          icon({
            name: iconName,
            x,
            y,
            size: w,
            fill: iconColor,
            className: isHighlighted ? 'fire-icon' : undefined,
          }),
      },
      // Value
      {
        type: 'leaf',
        width: 'auto',
        height: 'auto',
        measure: () => ({
          width: estimateTextWidth(valueStr, isHighlighted ? 24 : 20),
          height: isHighlighted ? 26 : 22,
        }),
        render: (x, y) =>
          renderTypography(
            {
              x,
              y,
              text: valueStr,
              dominantBaseline: 'hanging',
            },
            isHighlighted ? 24 : 20,
            800,
            primaryColor,
          ),
      },
      // Label
      {
        type: 'leaf',
        width: 'auto',
        height: 'auto',
        measure: () => ({
          width: estimateTextWidth(label, 11),
          height: 12,
        }),
        render: (x, y) =>
          renderTypography(
            {
              x,
              y,
              text: label,
              dominantBaseline: 'hanging',
            },
            11,
            600,
            'var(--color-text-muted)',
          ),
      },
    ],
  };
}

/**
 * Renders the Streak Card SVG.
 */
export function renderStreakCard(stats: IContributionStats, options?: CardOptions): string {
  const resolvedTheme = resolveThemeWithOptions(options);
  const titleText = `${stats.username}'s GitHub Streaks`;

  const rootNode: ContainerNode = {
    type: 'column',
    width: 490,
    height: 165,
    padding: 16,
    spacing: 14,
    style: {
      rx: options?.borderRadius !== undefined ? options.borderRadius : 12,
      ry: options?.borderRadius !== undefined ? options.borderRadius : 12,
      fill: 'url(#card-bg-gradient)',
      stroke: options?.hideBorder ? 'none' : 'var(--color-border)',
      strokeWidth: options?.hideBorder ? 0 : 1,
      className: 'streak-card',
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
                name: 'fire',
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
              width: estimateTextWidth(titleText, 15),
              height: 17,
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
                15,
                700,
                'var(--color-accent)',
              ),
          },
        ],
      },
      // Stats Columns Row
      {
        type: 'row',
        width: 'fill',
        height: 'fill',
        spacing: 12,
        children: [
          createStreakStatBlock('calendar', stats.totalContributions, 'Total Contributions'),
          createStreakStatBlock('fire', stats.currentStreak, 'Current Streak', true),
          createStreakStatBlock('star', stats.longestStreak, 'Longest Streak'),
        ],
      },
    ],
  };

  // Compute and Render layout
  const computed = computeLayout(rootNode, 490, 165);
  const layoutContent = renderLayout(computed);

  // Background Gradient Definition
  const stopColor = adjustColor(resolvedTheme.background, 10);
  const defs = `
  <defs>
    <linearGradient id="card-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${resolvedTheme.background}" />
      <stop offset="100%" stop-color="${stopColor}" />
    </linearGradient>
  </defs>
  `;

  // Custom Premium Styles
  const customStyles = `
    .streak-card {
      filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15));
      transition: transform 0.3s ease, filter 0.3s ease;
    }
    .streak-block {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .streak-block:hover {
      transform: translateY(-2px);
    }
    .streak-block.active {
      box-shadow: 0px 4px 10px rgba(255, 90, 0, 0.15);
    }
    .fire-icon {
      filter: drop-shadow(0px 2px 4px rgba(255, 90, 0, 0.3));
      animation: pulse 2s infinite ease-in-out;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `;

  return svgDocument(
    {
      width: 490,
      height: 165,
      theme: resolvedTheme,
      customStyles,
    },
    [defs, layoutContent],
  );
}
