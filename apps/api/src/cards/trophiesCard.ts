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
): LayoutNode {
  return {
    type: 'row',
    width: 'fill',
    height: 'fill',
    padding: 8,
    spacing: 8,
    alignItems: 'center',
    style: {
      rx: 6,
      ry: 6,
      fill: 'rgba(255, 255, 255, 0.03)',
      stroke: 'var(--color-border)',
      strokeWidth: 1,
      className: 'trophy-block',
    },
    children: [
      // Left circle badge with icon
      {
        type: 'leaf',
        width: 30,
        height: 30,
        render: (x: number, y: number, w: number, _h: number) => {
          const circleRadius = w / 2;
          const cx = x + circleRadius;
          const cy = y + circleRadius;
          const iconSize = w * 0.6;
          const iconOffset = (w - iconSize) / 2;
          return `
            <circle cx="${cx}" cy="${cy}" r="${circleRadius}" fill="${tierColor}20" stroke="${tierColor}" stroke-width="1" />
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
        spacing: 2,
        justifyContent: 'center',
        children: [
          {
            type: 'leaf',
            width: 'auto',
            height: 'auto',
            measure: () => ({
              width: estimateTextWidth(label, 11),
              height: 12,
            }),
            render: (x: number, y: number) =>
              renderTypography(
                {
                  x,
                  y,
                  text: label,
                  dominantBaseline: 'hanging',
                },
                11,
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

  const starTrophy = calculateTrophy('stars', stats.totalStars);
  const commitTrophy = calculateTrophy('commits', stats.totalCommits);
  const prTrophy = calculateTrophy('prs', stats.pullRequests);
  const issueTrophy = calculateTrophy('issues', stats.issues);
  const followerTrophy = calculateTrophy('followers', stats.followers);
  const repoTrophy = calculateTrophy('repos', stats.totalRepositories);

  const rootNode: ContainerNode = {
    type: 'column',
    width: 490,
    height: 195,
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
      // Trophies Grid Column (2 rows)
      {
        type: 'column',
        width: 'fill',
        spacing: 10,
        children: [
          // Row 1
          {
            type: 'row',
            width: 'fill',
            spacing: 10,
            children: [
              createTrophyBlock('star', 'Stars', stats.totalStars, starTrophy.tierName, starTrophy.color),
              createTrophyBlock('commit', 'Commits', stats.totalCommits, commitTrophy.tierName, commitTrophy.color),
              createTrophyBlock('pullRequest', 'PRs', stats.pullRequests, prTrophy.tierName, prTrophy.color),
            ],
          },
          // Row 2
          {
            type: 'row',
            width: 'fill',
            spacing: 10,
            children: [
              createTrophyBlock('issue', 'Issues', stats.issues, issueTrophy.tierName, issueTrophy.color),
              createTrophyBlock('followers', 'Followers', stats.followers, followerTrophy.tierName, followerTrophy.color),
              createTrophyBlock('repo', 'Repos', stats.totalRepositories, repoTrophy.tierName, repoTrophy.color),
            ],
          },
        ],
      },
    ],
  };

  // Compute and Render layout
  const computed = computeLayout(rootNode, 490, 195);
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
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .trophy-block:hover {
      transform: translateY(-2px);
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    }
  `;

  return svgDocument(
    {
      width: 490,
      height: 195,
      theme: resolvedTheme,
      customStyles,
    },
    [defs, layoutContent],
  );
}
