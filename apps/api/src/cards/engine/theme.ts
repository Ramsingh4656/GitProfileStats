import type { Theme } from './types.js';

export const THEMES: Record<string, Theme> = {
  light: {
    name: 'light',
    background: '#ffffff',
    primaryText: '#24292f',
    secondaryText: '#57606a',
    border: '#d0d7de',
    accent: '#0969da',
    progressColors: {
      background: '#eaeef2',
      fill: '#0969da',
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  dark: {
    name: 'dark',
    background: '#0d1117',
    primaryText: '#c9d1d9',
    secondaryText: '#8b949e',
    border: '#30363d',
    accent: '#58a6ff',
    progressColors: {
      background: '#161b22',
      fill: '#58a6ff',
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  github: {
    name: 'github',
    background: '#0d1117',
    primaryText: '#c9d1d9',
    secondaryText: '#8b949e',
    border: '#30363d',
    accent: '#2ea44f',
    progressColors: {
      background: '#161b22',
      fill: '#2ea44f',
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  dracula: {
    name: 'dracula',
    background: '#282a36',
    primaryText: '#f8f8f2',
    secondaryText: '#6272a4',
    border: '#44475a',
    accent: '#50fa7b',
    progressColors: {
      background: '#44475a',
      fill: '#ff79c6',
    },
    fontFamily: 'Courier New, Courier, monospace',
  },
  nord: {
    name: 'nord',
    background: '#2e3440',
    primaryText: '#d8dee9',
    secondaryText: '#4c566a',
    border: '#3b4252',
    accent: '#88c0d0',
    progressColors: {
      background: '#3b4252',
      fill: '#88c0d0',
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
};

export const DEFAULT_THEME_NAME = 'dark';

export function resolveTheme(themeInput?: string | Theme): Theme {
  const defaultTheme = THEMES[DEFAULT_THEME_NAME];
  if (!defaultTheme) {
    throw new Error(`Default theme ${DEFAULT_THEME_NAME} is not defined.`);
  }
  if (!themeInput) {
    return defaultTheme;
  }
  if (typeof themeInput === 'string') {
    return THEMES[themeInput] ?? defaultTheme;
  }
  return themeInput;
}

export function generateThemeStyles(theme: Theme): string {
  const font = theme.fontFamily ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
  return `
    :root {
      --color-bg: ${theme.background};
      --color-text: ${theme.primaryText};
      --color-text-muted: ${theme.secondaryText};
      --color-primary: ${theme.progressColors.fill};
      --color-secondary: ${theme.progressColors.background};
      --color-accent: ${theme.accent};
      --color-border: ${theme.border};
      --color-track-bg: ${theme.progressColors.background};
      --font-family: ${font};
    }
    svg {
      background-color: var(--color-bg);
      font-family: var(--font-family);
    }
    .bg { fill: var(--color-bg); }
    .text { fill: var(--color-text); }
    .text-muted { fill: var(--color-text-muted); }
    .primary { fill: var(--color-primary); }
    .secondary { fill: var(--color-secondary); }
    .accent { fill: var(--color-accent); }
    .border { stroke: var(--color-border); }
    .track-bg { fill: var(--color-track-bg); }
  `.trim();
}
