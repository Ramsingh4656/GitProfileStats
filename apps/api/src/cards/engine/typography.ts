import { text as svgText } from './helpers.js';
import type { TextOptions, TypographyOptions } from './types.js';

/**
 * Estimates the rendered width of a text string based on a character-width heuristic.
 * This is useful for server-side SVG generation where DOM measurement methods
 * like getComputedTextLength() are not available.
 *
 * @param text The input string to measure.
 * @param fontSize The active font size in pixels.
 * @returns The estimated width in pixels.
 */
export function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0;
  const puncts = ".,;:!'";
  const specials = '&@#$^*()_-+=[]{}|\\/<>?';

  for (const char of text) {
    if (char >= 'A' && char <= 'Z') {
      width += 0.65;
    } else if (char >= 'a' && char <= 'z') {
      width += 0.48;
    } else if (char >= '0' && char <= '9') {
      width += 0.55;
    } else if (char === ' ' || char === '\t') {
      width += 0.28;
    } else if (puncts.includes(char)) {
      width += 0.25;
    } else if (specials.includes(char)) {
      width += 0.6;
    } else {
      const code = char.charCodeAt(0);
      if (code > 255) {
        width += 1.0; // Wide characters (e.g., CJK / Emoji)
      } else {
        width += 0.5;
      }
    }
  }
  return width * fontSize;
}

/**
 * Generates an SVG text element, scaling the font size down proportionally
 * if the estimated width exceeds the specified maxWidth.
 */
export function renderTypography(
  options: TypographyOptions,
  defaultFontSize: number,
  defaultFontWeight: string | number,
  defaultColor: string
): string {
  const { text: content, maxWidth, color, fontWeight, className, ...rest } = options;

  let fontSize = defaultFontSize;
  if (maxWidth !== undefined && maxWidth > 0) {
    const estimatedWidth = estimateTextWidth(content, defaultFontSize);
    if (estimatedWidth > maxWidth) {
      fontSize = (maxWidth / estimatedWidth) * defaultFontSize;
    }
  }

  const textOpts: TextOptions = {
    ...rest,
    fontSize,
    fontWeight: fontWeight ?? defaultFontWeight,
    fill: color ?? defaultColor,
    className: className ?? undefined,
  };

  return svgText(textOpts, content);
}

/**
 * Renders a title text element.
 * Default: font-size = 16, font-weight = 600, color = var(--color-accent)
 */
export function title(options: TypographyOptions): string {
  return renderTypography(options, 16, 600, 'var(--color-accent)');
}

/**
 * Renders a subtitle text element.
 * Default: font-size = 14, font-weight = 400, color = var(--color-text-muted)
 */
export function subtitle(options: TypographyOptions): string {
  return renderTypography(options, 14, 400, 'var(--color-text-muted)');
}

/**
 * Renders a body text element.
 * Default: font-size = 13, font-weight = 400, color = var(--color-text)
 */
export function body(options: TypographyOptions): string {
  return renderTypography(options, 13, 400, 'var(--color-text)');
}

/**
 * Renders a caption text element.
 * Default: font-size = 11, font-weight = 400, color = var(--color-text-muted)
 */
export function caption(options: TypographyOptions): string {
  return renderTypography(options, 11, 400, 'var(--color-text-muted)');
}

/**
 * Renders a statistic value text element.
 * Default: font-size = 24, font-weight = 800, color = var(--color-text)
 */
export function statisticValue(options: TypographyOptions): string {
  return renderTypography(options, 24, 800, 'var(--color-text)');
}
