import {
  svgDocument,
  image,
  circle,
  icon,
  caption,
  estimateTextWidth,
  renderTypography,
  resolveThemeWithOptions,
  computeLayout,
  renderLayout,
  type ContainerNode,
  type LayoutNode,
  type CardOptions,
} from './engine/index.js';
import type { GitHubUser } from '../github/github.service.js';
import { fetchBase64Image } from '../utils/image.js';

/**
 * Creates a layout node for a single statistic item (value + label + icon).
 */
function createStatNode(
  iconName: 'repo' | 'followers' | 'lock',
  count: number,
  label: string,
): LayoutNode {
  const countStr = count.toLocaleString();
  return {
    type: 'column',
    spacing: 2,
    alignItems: 'start',
    style: {
      className: 'stat-item',
    },
    children: [
      {
        type: 'row',
        spacing: 6,
        alignItems: 'center',
        children: [
          {
            type: 'leaf',
            width: 14,
            height: 14,
            render: (x: number, y: number, w: number, _h: number) =>
              icon({
                name: iconName,
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
              width: estimateTextWidth(countStr, 13),
              height: 14,
            }),
            render: (x: number, y: number, _w: number, _h: number) =>
              renderTypography(
                {
                  x,
                  y,
                  text: countStr,
                  dominantBaseline: 'hanging',
                },
                13,
                700,
                'var(--color-text)',
              ),
          },
        ],
      },
      {
        type: 'leaf',
        width: 'auto',
        height: 'auto',
        measure: () => ({
          width: estimateTextWidth(label, 11),
          height: 12,
        }),
        render: (x: number, y: number, _w: number, _h: number) =>
          caption({
            x,
            y,
            text: label,
            dominantBaseline: 'hanging',
          }),
      },
    ],
  };
}

/**
 * Renders a full Profile Card as an SVG string.
 */
export async function renderProfileCard(
  user: GitHubUser,
  statsOrOptions?: { publicRepositories: number; privateRepositories: number } | CardOptions | null,
  optionsInput?: CardOptions,
): Promise<string> {
  let stats: { publicRepositories: number; privateRepositories: number } | null = null;
  let options = optionsInput;

  if (statsOrOptions) {
    if (
      'theme' in statsOrOptions ||
      'accent' in statsOrOptions ||
      'background' in statsOrOptions ||
      'borderRadius' in statsOrOptions ||
      'hideBorder' in statsOrOptions ||
      'fontFamily' in statsOrOptions ||
      'fontStyle' in statsOrOptions
    ) {
      options = statsOrOptions;
    } else {
      stats = statsOrOptions;
    }
  }

  const resolvedTheme = resolveThemeWithOptions(options);

  // 1. Fetch avatar and convert to base64
  const avatarBase64 = await fetchBase64Image(user.avatar_url);

  const displayName = user.name ?? user.login;
  const displayUsername = user.name ? `@${user.login}` : '';

  let bioText = user.bio ?? '';
  if (bioText.length > 60) {
    bioText = bioText.substring(0, 57) + '...';
  }

  const publicRepos = stats ? stats.publicRepositories : user.public_repos;
  const privateRepos = stats ? stats.privateRepositories : 0;

  // Construct detailsChildren for Name, Username, and truncated Bio
  const detailsChildren: LayoutNode[] = [];

  const nameAndUserChildren: LayoutNode[] = [
    {
      type: 'leaf',
      width: 'auto',
      height: 'auto',
      measure: () => ({
        width: estimateTextWidth(displayName, 16),
        height: 18,
      }),
      render: (x: number, y: number) =>
        renderTypography(
          {
            x,
            y,
            text: displayName,
            dominantBaseline: 'hanging',
            maxWidth: 180,
          },
          16,
          700,
          'var(--color-text)',
        ),
    },
  ];

  if (displayUsername) {
    nameAndUserChildren.push({
      type: 'leaf',
      width: 'auto',
      height: 'auto',
      measure: () => ({
        width: estimateTextWidth(displayUsername, 12),
        height: 14,
      }),
      render: (x: number, y: number) =>
        renderTypography(
          {
            x,
            y,
            text: displayUsername,
            dominantBaseline: 'hanging',
            maxWidth: 100,
          },
          12,
          400,
          'var(--color-text-muted)',
        ),
    });
  }

  detailsChildren.push({
    type: 'row',
    spacing: 8,
    alignItems: 'center',
    children: nameAndUserChildren,
  });

  if (bioText) {
    detailsChildren.push({
      type: 'leaf',
      width: 'auto',
      height: 'auto',
      measure: () => ({
        width: estimateTextWidth(bioText, 11),
        height: 12,
      }),
      render: (x: number, y: number) =>
        caption({
          x,
          y,
          text: bioText,
          dominantBaseline: 'hanging',
          maxWidth: 320,
        }),
    });
  }

  // 2. Build layout tree
  const rootNode: ContainerNode = {
    type: 'row',
    width: 800,
    height: 120,
    padding: 16,
    spacing: 20,
    alignItems: 'center',
    style: {
      rx: options?.borderRadius ?? 10,
      ry: options?.borderRadius ?? 10,
      fill: 'var(--color-bg)',
      stroke: options?.hideBorder ? 'none' : 'var(--color-border)',
      strokeWidth: options?.hideBorder ? 0 : 1,
      className: 'profile-card',
    },
    children: [
      // Left Part: Circular Avatar
      {
        type: 'leaf',
        width: 80,
        height: 80,
        render: (x: number, y: number, w: number, h: number) => {
          const cx = x + w / 2;
          const cy = y + h / 2;
          const r = Math.min(w, h) / 2;

          const avatarImage = image({
            x,
            y,
            width: w,
            height: h,
            href: avatarBase64,
            clipPath: 'url(#avatar-clip)',
          });

          const avatarBorder = circle({
            cx,
            cy,
            r: r - 1,
            fill: 'none',
            stroke: 'var(--color-accent)',
            strokeWidth: 2.5,
          });

          return `${avatarImage}\n  ${avatarBorder}`;
        },
      },
      // Middle Part: Profile Details & Bio
      {
        type: 'column',
        width: 'fill',
        height: 'fill',
        justifyContent: 'center',
        spacing: 8,
        children: detailsChildren,
      },
      // Right Part: Stats Row
      {
        type: 'row',
        spacing: 16,
        alignItems: 'center',
        children: [
          createStatNode('repo', publicRepos, 'Public Repos'),
          createStatNode('lock', privateRepos, 'Private Repos'),
          createStatNode('followers', user.followers, 'Followers'),
          createStatNode('followers', user.following, 'Following'),
        ],
      },
    ],
  };

  // Compute and Render layout
  const computed = computeLayout(rootNode, 800, 120);
  const layoutContent = renderLayout(computed);

  const defs = `
  <defs>
    <clipPath id="avatar-clip" clipPathUnits="objectBoundingBox">
      <circle cx="0.5" cy="0.5" r="0.5" />
    </clipPath>
  </defs>
  `;

  const customStyles = `
    .profile-card {
      filter: drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.15));
      transition: transform 0.3s ease, filter 0.3s ease;
    }
    .stat-item {
      transition: transform 0.2s ease;
    }
    .stat-item:hover {
      transform: translateY(-2px);
    }
  `;

  return svgDocument(
    {
      width: 800,
      height: 120,
      theme: resolvedTheme,
      customStyles,
    },
    [defs, layoutContent],
  );
}
