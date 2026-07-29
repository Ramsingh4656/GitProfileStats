import { Theme } from './types.js';

export const THEMES: Record<string, Theme> = {
  light: {
    name: 'light',
    bg: '#ffffff',
    text: '#24292f',
    textMuted: '#57606a',
    primary: '#0969da',
    secondary: '#afb8c1',
    accent: '#1a7f37',
    border: '#d0d7de',
    trackBg: '#eaeef2',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  dark: {
    name: 'dark',
    bg: '#0d1117',
    text: '#c9d1d9',
    textMuted: '#8b949e',
    primary: '#58a6ff',
    secondary: '#30363d',
    accent: '#238636',
    border: '#30363d',
    trackBg: '#161b22',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  dracula: {
    name: 'dracula',
    bg: '#282a36',
    text: '#f8f8f2',
    textMuted: '#6272a4',
    primary: '#ff79c6',
    secondary: '#44475a',
    accent: '#50fa7b',
    border: '#44475a',
    trackBg: '#44475a',
    fontFamily: 'Courier New, Courier, monospace',
  },
  monokai: {
    name: 'monokai',
    bg: '#272822',
    text: '#f8f8f2',
    textMuted: '#75715e',
    primary: '#f92672',
    secondary: '#3e3d32',
    accent: '#a6e22e',
    border: '#49483e',
    trackBg: '#3e3d32',
    fontFamily: 'Courier New, Courier, monospace',
  },
  nord: {
    name: 'nord',
    bg: '#2e3440',
    text: '#d8dee9',
    textMuted: '#4c566a',
    primary: '#88c0d0',
    secondary: '#3b4252',
    accent: '#a3be8c',
    border: '#3b4252',
    trackBg: '#3b4252',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
};

export const DEFAULT_THEME_NAME = 'dark';

export function resolveTheme(themeInput?: string | Theme): Theme {
  const defaultTheme = THEMES[DEFAULT_THEME_NAME]!;
  if (!themeInput) {
    return defaultTheme;
  }
  if (typeof themeInput === 'string') {
    return THEMES[themeInput] || defaultTheme;
  }
  return themeInput;
}

export function generateThemeStyles(theme: Theme): string {
  const font = theme.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
  return `
    :root {
      --color-bg: ${theme.bg};
      --color-text: ${theme.text};
      --color-text-muted: ${theme.textMuted};
      --color-primary: ${theme.primary};
      --color-secondary: ${theme.secondary};
      --color-accent: ${theme.accent};
      --color-border: ${theme.border};
      --color-track-bg: ${theme.trackBg};
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
