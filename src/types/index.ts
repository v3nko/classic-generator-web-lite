/*
 * Copyright (c) Victor Kosenko
 * Classic Generator Web Lite
 */

export type GeneratorType = 'num' | 'num_fixed';

export interface NumOptions {
  min: number;
  max: number;
}

export interface NumFixedOptions {
  length: number;
}

export interface GeneratorOptionsMap {
  num: NumOptions;
  num_fixed: NumFixedOptions;
}

export interface GeneratedItem {
  id: string;
  value: string;
  type: GeneratorType;
  summary: string;
  timestamp: number;
}

export type ThemeMode = 'dark' | 'light';

export interface AppState {
  activeGenerator: GeneratorType;
  theme: ThemeMode;
  soundEnabled: boolean;
  options: GeneratorOptionsMap;
  lastGenerated: GeneratedItem | null;
  history: GeneratedItem[];
}

export type ActiveView = 'generator' | 'history';

export const GENERATOR_CONFIGS: Record<GeneratorType, {
  name: string;
  shortLabel: string;
  prefix: string;
  description: string;
}> = {
  num: {
    name: 'Numeric',
    shortLabel: 'Num',
    prefix: 'N',
    description: 'Generates values from minimum up to maximum.',
  },
  num_fixed: {
    name: 'Numeric fixed',
    shortLabel: 'Fixed',
    prefix: 'F',
    description: 'Generates an exact number of digits with leading zeroes.',
  },
};

export const GENERATOR_LIMITS = {
  MAX_DIGIT_LENGTH: 150,
  MIN_DIGIT_LENGTH: 1,
  DEFAULT_NUM_MIN: 0,
  DEFAULT_NUM_MAX: 100,
  DEFAULT_FIXED_LENGTH: 6,
} as const;
