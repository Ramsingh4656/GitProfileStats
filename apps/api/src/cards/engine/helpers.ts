import { resolveTheme, generateThemeStyles } from './theme.js';
import type {
  SvgDocumentOptions,
  RectOptions,
  TextOptions,
  ImageOptions,
  CircleOptions,
  LineOptions,
  ProgressBarOptions,
} from './types.js';

// XML Escaping
export function escapeXml(str: string): string {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

// Attribute Mapping
const ATTRIBUTE_MAP: Record<string, string> = {
  className: 'class',
  strokeWidth: 'stroke-width',
  strokeDasharray: 'stroke-dasharray',
  textAnchor: 'text-anchor',
  dominantBaseline: 'dominant-baseline',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  fontFamily: 'font-family',
  clipPath: 'clip-path',
  preserveAspectRatio: 'preserveAspectRatio',
};

const attributeNameCache = new Map<string, string>();

/**
 * Clears the attribute name cache. Useful for test suites.
 */
export function clearAttributeNameCache(): void {
  attributeNameCache.clear();
}

export function getAttributeName(key: string): string {
  const cached = attributeNameCache.get(key);
  if (cached !== undefined) return cached;

  let resolved: string;
  if (ATTRIBUTE_MAP[key]) {
    resolved = ATTRIBUTE_MAP[key];
  } else {
    const preserveCamel = ['viewBox', 'preserveAspectRatio'];
    if (preserveCamel.includes(key)) {
      resolved = key;
    } else if (/[:-]/.test(key)) {
      resolved = key;
    } else {
      resolved = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    }
  }

  attributeNameCache.set(key, resolved);
  return resolved;
}

export function formatAttributes(attrs: Record<string, string | number | undefined>): string {
  const parts = Object.entries(attrs)
    .filter(([_, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${getAttributeName(k)}="${escapeXml(String(v))}"`);
  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

export function svgDocument(options: SvgDocumentOptions, content: string | string[]): string {
  const theme = resolveTheme(options.theme);
  const themeStyles = generateThemeStyles(theme);
  const innerContent = Array.isArray(content) ? content.join('\n  ') : content;

  const docAttrs = {
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    width: options.width,
    height: options.height,
    viewBox: options.viewBox ?? `0 0 ${String(options.width)} ${String(options.height)}`,
    ...options.attributes,
  };

  const styleBlock = `<style>\n    ${themeStyles.replace(/\n/g, '\n    ')}\n    ${(options.customStyles ?? '').replace(/\n/g, '\n    ')}\n  </style>`;

  return `<svg${formatAttributes(docAttrs)}>\n  ${styleBlock}\n  ${innerContent}\n</svg>`;
}

export function rect(options: RectOptions): string {
  const { customAttributes, ...rest } = options;
  const attrs = {
    ...rest,
    ...customAttributes,
  };
  return `<rect${formatAttributes(attrs)} />`;
}

export function text(options: TextOptions, content: string): string {
  const { customAttributes, ...rest } = options;
  const attrs = {
    ...rest,
    ...customAttributes,
  };
  return `<text${formatAttributes(attrs)}>${escapeXml(content)}</text>`;
}

export function image(options: ImageOptions): string {
  const { customAttributes, ...rest } = options;
  const attrs = {
    ...rest,
    ...customAttributes,
  };
  return `<image${formatAttributes(attrs)} />`;
}

export function circle(options: CircleOptions): string {
  const { customAttributes, ...rest } = options;
  const attrs = {
    ...rest,
    ...customAttributes,
  };
  return `<circle${formatAttributes(attrs)} />`;
}

export function line(options: LineOptions): string {
  const { customAttributes, ...rest } = options;
  const attrs = {
    ...rest,
    ...customAttributes,
  };
  return `<line${formatAttributes(attrs)} />`;
}

export function progressBar(options: ProgressBarOptions): string {
  const {
    x,
    y,
    width,
    height,
    value,
    max = 100,
    rx,
    ry,
    color,
    backgroundColor,
    className,
  } = options;

  const numericWidth = typeof width === 'number' ? width : parseFloat(width);
  const percent = Math.min(Math.max(value / max, 0), 1);
  const progressWidth = numericWidth * percent;

  const groupAttrs = className ? ` class="${escapeXml(className)}"` : '';

  const trackAttrs = formatAttributes({
    x,
    y,
    width,
    height,
    rx,
    ry,
    fill: backgroundColor ?? 'var(--color-track-bg)',
  });

  if (percent <= 0) {
    return `<g${groupAttrs}>\n    <rect${trackAttrs} />\n  </g>`;
  }

  const barAttrs = formatAttributes({
    x,
    y,
    width: progressWidth,
    height,
    rx,
    ry,
    fill: color ?? 'var(--color-primary)',
  });

  return `<g${groupAttrs}>\n    <rect${trackAttrs} />\n    <rect${barAttrs} />\n  </g>`;
}
