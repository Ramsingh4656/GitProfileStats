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

export interface ITrophiesStatsData {
  username: string;
  name: string | null;
  totalStars: number;
  totalCommits: number;
  totalRepositories: number;
  pullRequests: number;
  issues: number;
  followers: number;
}

export type TrophyTier = 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export const TIER_THRESHOLDS = {
  stars: [
    { tier: 'PLATINUM', threshold: 1000, name: 'Platinum', color: '#00e5ff' },
    { tier: 'GOLD', threshold: 200, name: 'Gold', color: '#ffd700' },
    { tier: 'SILVER', threshold: 50, name: 'Silver', color: '#a6a6a6' },
    { tier: 'BRONZE', threshold: 10, name: 'Bronze', color: '#c5a059' },
  ],
  commits: [
    { tier: 'PLATINUM', threshold: 10000, name: 'Platinum', color: '#00e5ff' },
    { tier: 'GOLD', threshold: 2000, name: 'Gold', color: '#ffd700' },
    { tier: 'SILVER', threshold: 500, name: 'Silver', color: '#a6a6a6' },
    { tier: 'BRONZE', threshold: 100, name: 'Bronze', color: '#c5a059' },
  ],
  prs: [
    { tier: 'PLATINUM', threshold: 500, name: 'Platinum', color: '#00e5ff' },
    { tier: 'GOLD', threshold: 100, name: 'Gold', color: '#ffd700' },
    { tier: 'SILVER', threshold: 25, name: 'Silver', color: '#a6a6a6' },
    { tier: 'BRONZE', threshold: 5, name: 'Bronze', color: '#c5a059' },
  ],
  issues: [
    { tier: 'PLATINUM', threshold: 500, name: 'Platinum', color: '#00e5ff' },
    { tier: 'GOLD', threshold: 100, name: 'Gold', color: '#ffd700' },
    { tier: 'SILVER', threshold: 25, name: 'Silver', color: '#a6a6a6' },
    { tier: 'BRONZE', threshold: 5, name: 'Bronze', color: '#c5a059' },
  ],
  followers: [
    { tier: 'PLATINUM', threshold: 1000, name: 'Platinum', color: '#00e5ff' },
    { tier: 'GOLD', threshold: 200, name: 'Gold', color: '#ffd700' },
    { tier: 'SILVER', threshold: 50, name: 'Silver', color: '#a6a6a6' },
    { tier: 'BRONZE', threshold: 10, name: 'Bronze', color: '#c5a059' },
  ],
  repos: [
    { tier: 'PLATINUM', threshold: 200, name: 'Platinum', color: '#00e5ff' },
    { tier: 'GOLD', threshold: 50, name: 'Gold', color: '#ffd700' },
    { tier: 'SILVER', threshold: 20, name: 'Silver', color: '#a6a6a6' },
    { tier: 'BRONZE', threshold: 5, name: 'Bronze', color: '#c5a059' },
  ],
} as const;

export function calculateTrophy(
  category: keyof typeof TIER_THRESHOLDS,
  value: number,
): { tier: TrophyTier; tierName: string; color: string } {
  const thresholds = TIER_THRESHOLDS[category];
  for (const t of thresholds) {
    if (value >= t.threshold) {
      return {
        tier: t.tier,
        tierName: t.name,
        color: t.color,
      };
    }
  }
  return {
    tier: 'NONE',
    tierName: 'Beginner',
    color: '#8b949e',
  };
}

function createTrophyBlock(
  iconName: IconName,
  label: string,
  value: number,
  tierName: string,
  tierColor: string,
  tier: TrophyTier,
): LayoutNode {
  const isNone = tier === 'NONE';
  const fill = isNone ? 'rgba(255, 255, 255, 0.03)' : `${tierColor}0d`;
  const stroke = isNone ? 'var(--color-border)' : tierColor;
  const strokeWidth = isNone ? 1 : 1.5;

  return {
    type: 'row',
    width: 'fill',
    height: 48,
    padding: 8,
    spacing: 8,
    alignItems: 'center',
    style: {
      rx: 8,
      ry: 8,
      fill,
      stroke,
      strokeWidth,
      className: `trophy-block trophy-block-${tier.toLowerCase()}`,
    },
    children: [
      // Left badge with icon
      {
        type: 'leaf',
        width: 28,
        height: 28,
        render: (x: number, y: number, w: number, _h: number) => {
          const rx = 6;
          const ry = 6;
          const iconSize = 16;
          const iconOffset = (w - iconSize) / 2;
          return `
            <rect x="${x}" y="${y}" width="${w}" height="${w}" rx="${rx}" ry="${ry}" fill="${tierColor}15" stroke="${tierColor}30" stroke-width="1" />
            ${icon({
              name: iconName,
              x: x + iconOffset,
              y: y + iconOffset,
              size: iconSize,
              fill: tierColor,
            })}
          `;
        },
      },
      // Right column text
      {
        type: 'column',
        width: 'fill',
        spacing: 1,
        justifyContent: 'center',
        children: [
          {
            type: 'leaf',
            width: 'auto',
            height: 'auto',
            measure: () => ({
              width: estimateTextWidth(label, 10),
              height: 11,
            }),
            render: (x: number, y: number) =>
              renderTypography(
                {
                  x,
                  y,
                  text: label,
                  dominantBaseline: 'hanging',
                },
                10,
                700,
                'var(--color-text)',
              ),
          },
          {
            type: 'leaf',
            width: 'auto',
            height: 'auto',
            measure: () => ({
              width: estimateTextWidth(`${tierName} · ${value.toLocaleString()}`, 9),
              height: 10,
            }),
            render: (x: number, y: number) =>
              renderTypography(
                {
                  x,
                  y,
                  text: `${tierName} · ${value.toLocaleString()}`,
                  dominantBaseline: 'hanging',
                },
                9,
                600,
                tierColor,
              ),
          },
        ],
      },
    ],
  };
}

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

  // Determine if dark or light color
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

export function renderTrophiesCard(stats: ITrophiesStatsData, options?: CardOptions): string {
  const resolvedTheme = resolveThemeWithOptions(options);
  const titleText = `${stats.name ?? stats.username}'s GitHub Trophies`;

  // Dynamically map all available categories
  const trophies = [
    { category: 'stars', label: 'Stars', icon: 'star', value: stats.totalStars },
    { category: 'commits', label: 'Commits', icon: 'commit', value: stats.totalCommits },
    { category: 'prs', label: 'PRs', icon: 'pullRequest', value: stats.pullRequests },
    { category: 'issues', label: 'Issues', icon: 'issue', value: stats.issues },
    { category: 'followers', label: 'Followers', icon: 'followers', value: stats.followers },
    { category: 'repos', label: 'Repos', icon: 'repo', value: stats.totalRepositories },
  ] as const;

  const activeTrophies = trophies.filter(t => t.value !== undefined && t.value !== null);

  const trophyBlocks = activeTrophies.map(t => {
    const trophy = calculateTrophy(t.category, t.value);
    return createTrophyBlock(t.icon, t.label, t.value, trophy.tierName, trophy.color, trophy.tier);
  });

  const itemsPerRow = 3;
  const gridRows: LayoutNode[] = [];
  for (let i = 0; i < trophyBlocks.length; i += itemsPerRow) {
    const rowItems = trophyBlocks.slice(i, i + itemsPerRow);
    gridRows.push({
      type: 'row',
      width: 'fill',
      spacing: 10,
      children: rowItems,
    });
  }

  const rootNode: ContainerNode = {
    type: 'column',
    width: 490,
    height: 'auto',
    padding: 20,
    spacing: 16,
    justifyContent: 'center',
    style: {
      rx: options?.borderRadius !== undefined ? options.borderRadius : 10,
      ry: options?.borderRadius !== undefined ? options.borderRadius : 10,
      fill: 'url(#card-bg-gradient)',
      stroke: options?.hideBorder ? 'none' : 'var(--color-border)',
      strokeWidth: options?.hideBorder ? 0 : 1,
      className: 'trophies-card',
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
            render: (x: number, y: number, w: number, _h: number) =>
              icon({
                name: 'star',
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
            render: (x: number, y: number, _w: number, _h: number) =>
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
      // Trophies Grid Column
      {
        type: 'column',
        width: 'fill',
        spacing: 10,
        children: gridRows,
      },
    ],
  };

  // Compute layout dynamically based on auto height
  const computed = computeLayout(rootNode, 490, 1000);
  const layoutContent = renderLayout(computed);

  // Gradient definitions using adjusted background colors
  const stopColor = adjustColor(resolvedTheme.background, 12);
  const defs = `
  <defs>
    <linearGradient id="card-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${resolvedTheme.background}" />
      <stop offset="100%" stop-color="${stopColor}" />
    </linearGradient>
  </defs>
  `;

  // Custom styles for hover effects and premium design
  const customStyles = `
    .trophies-card {
      filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15));
      transition: transform 0.3s ease, filter 0.3s ease;
    }
    .trophy-block {
      transition: filter 0.2s ease, transform 0.2s ease, stroke-width 0.2s ease;
      cursor: pointer;
    }
    .trophy-block:hover {
      transform: translateY(-1px);
    }
    .trophy-block-platinum:hover {
      filter: drop-shadow(0px 0px 4px #00e5ff80);
    }
    .trophy-block-gold:hover {
      filter: drop-shadow(0px 0px 4px #ffd70080);
    }
    .trophy-block-silver:hover {
      filter: drop-shadow(0px 0px 4px #a6a6a680);
    }
    .trophy-block-bronze:hover {
      filter: drop-shadow(0px 0px 4px #c5a05980);
    }
    .trophy-block-none:hover {
      filter: drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.1));
    }
  `;

  return svgDocument(
    {
      width: 490,
      height: computed.height,
      theme: resolvedTheme,
      customStyles,
    },
    [defs, layoutContent],
  );
}
