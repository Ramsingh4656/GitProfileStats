/* eslint-disable @typescript-eslint/naming-convention */
export interface Theme {
  name: string;
  background: string;
  primaryText: string;
  secondaryText: string;
  border: string;
  accent: string;
  progressColors: {
    background: string;
    fill: string;
  };
  fontFamily?: string;
}

export interface SvgDocumentOptions {
  width: number | string;
  height: number | string;
  theme?: string | Theme;
  customStyles?: string;
  viewBox?: string;
  attributes?: Record<string, string>;
}

export interface RectOptions {
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
  rx?: number | string;
  ry?: number | string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
  opacity?: number | string;
  className?: string;
  customAttributes?: Record<string, string>;
}

export interface TextOptions {
  x: number | string;
  y: number | string;
  fill?: string;
  fontSize?: number | string;
  fontWeight?: string | number;
  fontFamily?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'auto' | 'middle' | 'hanging' | 'central' | 'alphabetic';
  opacity?: number | string;
  className?: string;
  customAttributes?: Record<string, string>;
}

export interface ImageOptions {
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
  href: string;
  clipPath?: string;
  preserveAspectRatio?: string;
  className?: string;
  customAttributes?: Record<string, string>;
}

export interface CircleOptions {
  cx: number | string;
  cy: number | string;
  r: number | string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
  opacity?: number | string;
  className?: string;
  customAttributes?: Record<string, string>;
}

export interface LineOptions {
  x1: number | string;
  y1: number | string;
  x2: number | string;
  y2: number | string;
  stroke?: string;
  strokeWidth?: number | string;
  strokeDasharray?: string;
  opacity?: number | string;
  className?: string;
  customAttributes?: Record<string, string>;
}

export interface ProgressBarOptions {
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
  value: number;
  max?: number;
  rx?: number | string;
  ry?: number | string;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export type IconName =
  | 'star'
  | 'repo'
  | 'fork'
  | 'commit'
  | 'pullRequest'
  | 'issue'
  | 'followers'
  | 'language';

export interface IconOptions {
  name: IconName;
  x?: number | string;
  y?: number | string;
  size?: number | string;
  fill?: string;
  className?: string;
  customAttributes?: Record<string, string>;
}

export interface TypographyOptions {
  x: number | string;
  y: number | string;
  text: string;
  maxWidth?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'auto' | 'middle' | 'hanging' | 'central' | 'alphabetic';
  opacity?: number | string;
  className?: string;
  customAttributes?: Record<string, string>;
}


