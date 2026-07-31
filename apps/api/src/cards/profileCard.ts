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
function createStatNode(iconName: 'repo' | 'followers', count: number, label: string): LayoutNode {
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
            render: (x: number, y: number, w: number, h: number) =>
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
            render: (x: number, y: number, w: number, h: number) =>
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
        render: (x: number, y: number, w: number, h: number) =>
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
export async function renderProfileCard(user: GitHubUser, options?: CardOptions): Promise<string> {
  const resolvedTheme = resolveThemeWithOptions(options);

  // 1. Fetch avatar and convert to base64
  const avatarBase64 = await fetchBase64Image(user.avatar_url);

  const displayName = user.name || user.login;
  const displayUsername = user.name ? `@${user.login}` : '';

  // Construct typed array of header details to avoid TS inference issue
  const headerChildren: LayoutNode[] = [];
  headerChildren.push({
    type: 'leaf',
    width: 'auto',
    height: 'auto',
    measure: () => ({
      width: estimateTextWidth(displayName, 18),
      height: 20,
    }),
    render: (x: number, y: number, w: number, h: number) =>
      renderTypography(
        {
          x,
          y,
          text: displayName,
          dominantBaseline: 'hanging',
          maxWidth: 280, // Prevent overflow for long names
        },
        18,
        700,
        'var(--color-text)',
      ),
  });

  if (displayUsername) {
    headerChildren.push({
      type: 'leaf',
      width: 'auto',
      height: 'auto',
      measure: () => ({
        width: estimateTextWidth(displayUsername, 13),
        height: 14,
      }),
      render: (x: number, y: number, w: number, h: number) =>
        renderTypography(
          {
            x,
            y,
            text: displayUsername,
            dominantBaseline: 'hanging',
            maxWidth: 280,
          },
          13,
          400,
          'var(--color-text-muted)',
        ),
    });
  }

  // 2. Build layout tree
  const rootNode: ContainerNode = {
    type: 'row',
    width: 450,
    height: 160,
    padding: 20,
    spacing: 24,
    alignItems: 'center',
    style: {
      rx: options?.borderRadius !== undefined ? options.borderRadius : 10,
      ry: options?.borderRadius !== undefined ? options.borderRadius : 10,
      fill: 'var(--color-bg)',
      stroke: options?.hideBorder ? 'none' : 'var(--color-border)',
      strokeWidth: options?.hideBorder ? 0 : 1,
      className: 'profile-card',
    },
    children: [
      // Left Part: Circular Avatar
      {
        type: 'leaf',
        width: 90,
        height: 90,
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
      // Right Part: Profile Details & Stats
      {
        type: 'column',
        width: 'fill',
        height: 'fill',
        justifyContent: 'center',
        spacing: 16,
        children: [
          // Header details (Name & Username)
          {
            type: 'column',
            spacing: 2,
            children: headerChildren,
          },
          // Stats Row
          {
            type: 'row',
            width: 'fill',
            justifyContent: 'space-between',
            alignItems: 'center',
            children: [
              createStatNode('repo', user.public_repos, 'Repos'),
              createStatNode('followers', user.followers, 'Followers'),
              createStatNode('followers', user.following, 'Following'),
            ],
          },
        ],
      },
    ],
  };

  // Compute and Render layout
  const computed = computeLayout(rootNode, 450, 160);
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
      width: 450,
      height: 160,
      theme: resolvedTheme,
      customStyles,
    },
    [defs, layoutContent],
  );
}
