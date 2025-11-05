/* eslint-disable style/quote-props */
import plugin from 'tailwindcss/plugin'

interface CssInJs {
  [key: string]: string | string[] | CssInJs | CssInJs[]
}

interface TailwindPluginAPI {
  addBase: (base: CssInJs) => void
  addUtilities: (utilities: Record<string, CssInJs | CssInJs[]>, options?: Record<string, unknown>) => void
  addComponents: (components: Record<string, CssInJs>, options?: Record<string, unknown>) => void
  theme: (path: string, defaultValue?: unknown) => unknown
}

interface TailwindPlugin {
  (api: TailwindPluginAPI): void
  handler: (api: TailwindPluginAPI) => void
  config?: Record<string, unknown>
}

interface TailwindConfigLike {
  presets?: TailwindConfigLike[]
  theme?: Record<string, unknown>
  plugins?: TailwindPlugin[]
  corePlugins?: Record<string, boolean>
  safelist?: Array<string | { pattern: RegExp }>
}

const spacingScale = {
  0: '0rpx',
  1: '8rpx',
  2: '16rpx',
  3: '24rpx',
  4: '32rpx',
  5: '40rpx',
  6: '48rpx',
  8: '64rpx',
} as const

const fontSizeScale = {
  xs: { size: '22rpx', lineHeight: '1.45' },
  sm: { size: '24rpx', lineHeight: '1.45' },
  md: { size: '28rpx', lineHeight: '1.5' },
  base: { size: '28rpx', lineHeight: '1.5' },
  lg: { size: '32rpx', lineHeight: '1.5' },
  xl: { size: '40rpx', lineHeight: '1.35' },
  '2xl': { size: '48rpx', lineHeight: '1.25' },
} as const

const colors = {
  transparent: 'transparent',
  surface: '#ffffff',
  'surface-muted': '#f4f6fb',
  'surface-strong': '#1e293b',
  primary: '#2563eb',
  'primary-soft': '#dbeafe',
  'primary-active': '#1d4ed8',
  secondary: '#38bdf8',
  'secondary-active': '#0ea5e9',
  success: '#16a34a',
  'success-soft': '#dcfce7',
  warning: '#f97316',
  'warning-soft': '#ffedd5',
  danger: '#ef4444',
  'danger-soft': '#fee2e2',
  muted: '#475569',
  'text-strong': '#0b1120',
  'text-muted': '#475569',
  'text-on-primary': '#ffffff',
  'text-on-tonal': '#1e293b',
  border: '#e2e8f0',
  'border-strong': '#cbd5f5',
  elevated: 'rgba(15, 23, 42, 0.04)',
  disabled: '#f1f5f9',
} as const

const radii = {
  none: '0',
  sm: '12rpx',
  DEFAULT: '16rpx',
  md: '16rpx',
  lg: '24rpx',
  full: '999rpx',
} as const

const shadows = {
  xs: '0 2rpx 6rpx rgba(15, 23, 42, 0.04)',
  sm: '0 6rpx 14rpx rgba(15, 23, 42, 0.08)',
  md: '0 10rpx 26rpx rgba(15, 23, 42, 0.12)',
} as const

const fonts = {
  sans: ['PingFang SC', 'Helvetica Neue', 'Segoe UI', 'Arial', 'sans-serif'],
  mono: ['SFMono-Regular', 'Menlo', 'Roboto Mono', 'monospace'],
}

function quoteFontFamily(values: string[]): string {
  return values
    .map(value => (value.includes(' ') ? `"${value}"` : value))
    .join(', ')
}

const baseTokens: CssInJs = {
  '--wt-font-sans': quoteFontFamily(fonts.sans),
  '--wt-font-mono': quoteFontFamily(fonts.mono),
  '--wt-color-primary': colors.primary,
  '--wt-color-primary-active': colors['primary-active'],
  '--wt-color-primary-soft': colors['primary-soft'],
  '--wt-color-secondary': colors.secondary,
  '--wt-color-secondary-active': colors['secondary-active'],
  '--wt-color-success': colors.success,
  '--wt-color-success-soft': colors['success-soft'],
  '--wt-color-warning': colors.warning,
  '--wt-color-warning-soft': colors['warning-soft'],
  '--wt-color-danger': colors.danger,
  '--wt-color-danger-soft': colors['danger-soft'],
  '--wt-color-surface': colors.surface,
  '--wt-color-surface-muted': colors['surface-muted'],
  '--wt-color-surface-strong': colors['surface-strong'],
  '--wt-color-elevated': colors.elevated,
  '--wt-color-border': colors.border,
  '--wt-color-border-strong': colors['border-strong'],
  '--wt-color-text': '#0f172a',
  '--wt-color-text-strong': colors['text-strong'],
  '--wt-color-text-muted': colors['text-muted'],
  '--wt-color-text-on-primary': colors['text-on-primary'],
  '--wt-color-text-on-tonal': colors['text-on-tonal'],
  '--wt-color-disabled': colors.disabled,
  '--wt-space-0': spacingScale[0],
  '--wt-space-1': spacingScale[1],
  '--wt-space-2': spacingScale[2],
  '--wt-space-3': spacingScale[3],
  '--wt-space-4': spacingScale[4],
  '--wt-space-5': spacingScale[5],
  '--wt-space-6': spacingScale[6],
  '--wt-space-8': spacingScale[8],
  '--wt-radius-sm': radii.sm,
  '--wt-radius-md': radii.md,
  '--wt-radius-lg': radii.lg,
  '--wt-radius-pill': radii.full,
  '--wt-shadow-xs': shadows.xs,
  '--wt-shadow-sm': shadows.sm,
  '--wt-shadow-md': shadows.md,
}

const darkTokens: CssInJs = {
  '--wt-color-surface': '#111827',
  '--wt-color-surface-muted': '#1f2937',
  '--wt-color-surface-strong': '#0f172a',
  '--wt-color-elevated': 'rgba(15, 23, 42, 0.48)',
  '--wt-color-border': '#273244',
  '--wt-color-border-strong': '#334155',
  '--wt-color-text': '#e2e8f0',
  '--wt-color-text-strong': '#f8fafc',
  '--wt-color-text-muted': '#94a3b8',
  '--wt-color-text-on-primary': '#ffffff',
  '--wt-color-disabled': '#1e293b',
}

function important(value: string): string {
  return `${value} !important`
}

function makeSpacingUtilities(spacing: Record<string, string>) {
  const utilities: Record<string, CssInJs> = {}

  for (const [key, value] of Object.entries(spacing)) {
    const padding = important(value)

    utilities[`.wt-p-${key}`] = { padding }
    utilities[`.wt-px-${key}`] = { paddingLeft: padding, paddingRight: padding }
    utilities[`.wt-py-${key}`] = { paddingTop: padding, paddingBottom: padding }
    utilities[`.wt-pt-${key}`] = { paddingTop: padding }
    utilities[`.wt-pr-${key}`] = { paddingRight: padding }
    utilities[`.wt-pb-${key}`] = { paddingBottom: padding }
    utilities[`.wt-pl-${key}`] = { paddingLeft: padding }

    const margin = important(value)

    utilities[`.wt-m-${key}`] = { margin }
    utilities[`.wt-mx-${key}`] = { marginLeft: margin, marginRight: margin }
    utilities[`.wt-my-${key}`] = { marginTop: margin, marginBottom: margin }
    utilities[`.wt-mt-${key}`] = { marginTop: margin }
    utilities[`.wt-mr-${key}`] = { marginRight: margin }
    utilities[`.wt-mb-${key}`] = { marginBottom: margin }
    utilities[`.wt-ml-${key}`] = { marginLeft: margin }

    utilities[`.wt-gap-${key}`] = { gap: margin }
  }

  return utilities
}

function makeFontSizeUtilities() {
  const utilities: Record<string, CssInJs> = {}

  for (const [key, { size, lineHeight }] of Object.entries(fontSizeScale)) {
    utilities[`.wt-text-${key}`] = {
      fontSize: important(size),
      lineHeight: important(lineHeight),
    }
  }

  return utilities
}

const baseUtilities: Record<string, CssInJs> = {
  '.wt-hidden': { display: 'none !important' },
  '.wt-inline': { display: 'inline !important' },
  '.wt-block': { display: 'block !important' },
  '.wt-flex': { display: 'flex !important' },
  '.wt-inline-flex': { display: 'inline-flex !important' },
  '.wt-grid': { display: 'grid !important' },
  '.wt-flex-col': { flexDirection: 'column !important' },
  '.wt-flex-row': { flexDirection: 'row !important' },
  '.wt-flex-1': { flex: '1 1 0% !important' },
  '.wt-flex-none': { flex: 'none !important' },
  '.wt-flex-wrap': { flexWrap: 'wrap !important' },
  '.wt-items-start': { alignItems: 'flex-start !important' },
  '.wt-items-center': { alignItems: 'center !important' },
  '.wt-items-end': { alignItems: 'flex-end !important' },
  '.wt-items-stretch': { alignItems: 'stretch !important' },
  '.wt-justify-start': { justifyContent: 'flex-start !important' },
  '.wt-justify-center': { justifyContent: 'center !important' },
  '.wt-justify-between': { justifyContent: 'space-between !important' },
  '.wt-justify-around': { justifyContent: 'space-around !important' },
  '.wt-grid-cols-1': { gridTemplateColumns: 'repeat(1, minmax(0, 1fr)) !important' },
  '.wt-grid-cols-2': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr)) !important' },
  '.wt-grid-cols-3': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) !important' },
  '.wt-grid-auto': { gridTemplateColumns: 'repeat(auto-fill, minmax(200rpx, 1fr)) !important' },
  '.wt-w-full': { width: '100% !important' },
  '.wt-w-auto': { width: 'auto !important' },
  '.wt-h-full': { height: '100% !important' },
  '.wt-min-w-0': { minWidth: '0 !important' },
  '.wt-max-w-none': { maxWidth: 'none !important' },
  '.wt-rounded-sm': { borderRadius: 'var(--wt-radius-sm) !important' },
  '.wt-rounded': { borderRadius: 'var(--wt-radius-md) !important' },
  '.wt-rounded-lg': { borderRadius: 'var(--wt-radius-lg) !important' },
  '.wt-rounded-full': { borderRadius: 'var(--wt-radius-pill) !important' },
  '.wt-border': { border: '1rpx solid var(--wt-color-border) !important' },
  '.wt-border-0': { border: '0 !important' },
  '.wt-border-primary': { borderColor: 'var(--wt-color-primary) !important' },
  '.wt-border-strong': { borderColor: 'var(--wt-color-border-strong) !important' },
  '.wt-border-transparent': { borderColor: 'transparent !important' },
  '.wt-bg-transparent': { backgroundColor: 'transparent !important' },
  '.wt-bg-surface': {
    backgroundColor: 'var(--wt-color-surface) !important',
    color: 'var(--wt-color-text) !important',
  },
  '.wt-bg-muted': { backgroundColor: 'var(--wt-color-surface-muted) !important' },
  '.wt-bg-primary': {
    backgroundColor: 'var(--wt-color-primary) !important',
    color: 'var(--wt-color-text-on-primary) !important',
  },
  '.wt-bg-primary-soft': {
    backgroundColor: 'var(--wt-color-primary-soft) !important',
    color: 'var(--wt-color-primary) !important',
  },
  '.wt-bg-secondary': {
    backgroundColor: 'var(--wt-color-secondary) !important',
    color: 'var(--wt-color-text-on-primary) !important',
  },
  '.wt-bg-success': {
    backgroundColor: 'var(--wt-color-success) !important',
    color: 'var(--wt-color-text-on-primary) !important',
  },
  '.wt-bg-warning': {
    backgroundColor: 'var(--wt-color-warning) !important',
    color: 'var(--wt-color-text-on-primary) !important',
  },
  '.wt-bg-danger': {
    backgroundColor: 'var(--wt-color-danger) !important',
    color: 'var(--wt-color-text-on-primary) !important',
  },
  '.wt-text-primary': { color: 'var(--wt-color-primary) !important' },
  '.wt-text-secondary': { color: 'var(--wt-color-secondary) !important' },
  '.wt-text-success': { color: 'var(--wt-color-success) !important' },
  '.wt-text-warning': { color: 'var(--wt-color-warning) !important' },
  '.wt-text-danger': { color: 'var(--wt-color-danger) !important' },
  '.wt-text-muted': { color: 'var(--wt-color-text-muted) !important' },
  '.wt-text-on-primary': { color: 'var(--wt-color-text-on-primary) !important' },
  '.wt-font-medium': { fontWeight: '500 !important' },
  '.wt-font-semibold': { fontWeight: '600 !important' },
  '.wt-font-bold': { fontWeight: '700 !important' },
  '.wt-leading-tight': { lineHeight: '1.35 !important' },
  '.wt-leading-relaxed': { lineHeight: '1.7 !important' },
  '.wt-truncate': {
    overflow: 'hidden !important',
    textOverflow: 'ellipsis !important',
    whiteSpace: 'nowrap !important',
  },
  '.wt-break-words': {
    wordWrap: 'break-word !important',
    wordBreak: 'break-word !important',
  },
  '.wt-shadow-none': { boxShadow: 'none !important' },
  '.wt-shadow-xs': { boxShadow: 'var(--wt-shadow-xs) !important' },
  '.wt-shadow-sm': { boxShadow: 'var(--wt-shadow-sm) !important' },
  '.wt-shadow-md': { boxShadow: 'var(--wt-shadow-md) !important' },
}

function buildComponents(api: TailwindPluginAPI): Record<string, CssInJs> {
  const minHeight = api.theme('minHeight') as Record<string, string>
  const spacing = api.theme('spacing') as Record<string, string>
  const getThemeString = (path: string, fallback: string) => {
    const value = api.theme(path)
    return typeof value === 'string' ? value : fallback
  }

  return {
    '.wt-surface': {
      backgroundColor: 'var(--wt-color-surface)',
      borderRadius: 'var(--wt-radius-lg)',
      border: '1rpx solid var(--wt-color-border)',
      padding: spacing[4],
      boxShadow: 'var(--wt-shadow-sm)',
    },
    '.wt-divider': {
      width: '100%',
      height: '1rpx',
      backgroundColor: 'var(--wt-color-border)',
    },
    '.wt-button': {
      '--wt-button-bg': 'var(--wt-color-primary)',
      '--wt-button-border': 'var(--wt-color-primary)',
      '--wt-button-color': 'var(--wt-color-text-on-primary)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: minHeight.button ?? '72rpx',
      minWidth: minHeight.button ?? '72rpx',
      padding: `0 ${spacing[4]}`,
      gap: spacing[2],
      borderRadius: 'var(--wt-radius-pill)',
      border: '1rpx solid var(--wt-button-border)',
      backgroundColor: 'var(--wt-button-bg)',
      color: 'var(--wt-button-color)',
      fontSize: fontSizeScale.md.size,
      fontWeight: '600',
      letterSpacing: '1rpx',
      textAlign: 'center',
      boxShadow: 'var(--wt-shadow-xs)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
      '&:active': {
        transform: 'scale(0.98)',
        boxShadow: 'none',
        backgroundColor: 'var(--wt-color-primary-active)',
        borderColor: 'var(--wt-color-primary-active)',
      },
      '&:disabled, &.is-disabled': {
        backgroundColor: 'var(--wt-color-disabled)',
        color: 'var(--wt-color-text-muted)',
        borderColor: 'var(--wt-color-border)',
        boxShadow: 'none',
        cursor: 'not-allowed',
      },
    },
    '.wt-button--secondary': {
      '--wt-button-bg': 'var(--wt-color-secondary)',
      '--wt-button-border': 'var(--wt-color-secondary)',
      '--wt-button-color': 'var(--wt-color-text-on-primary)',
    },
    '.wt-button--success': {
      '--wt-button-bg': 'var(--wt-color-success)',
      '--wt-button-border': 'var(--wt-color-success)',
      '--wt-button-color': 'var(--wt-color-text-on-primary)',
    },
    '.wt-button--danger': {
      '--wt-button-bg': 'var(--wt-color-danger)',
      '--wt-button-border': 'var(--wt-color-danger)',
      '--wt-button-color': 'var(--wt-color-text-on-primary)',
    },
    '.wt-button--outline': {
      '--wt-button-bg': 'transparent',
      '--wt-button-border': 'var(--wt-color-border-strong)',
      '--wt-button-color': 'var(--wt-color-text)',
      boxShadow: 'none',
      '&:active': {
        backgroundColor: 'var(--wt-color-primary-soft)',
        borderColor: 'var(--wt-color-primary)',
        color: 'var(--wt-color-primary)',
      },
    },
    '.wt-button--ghost': {
      '--wt-button-bg': 'transparent',
      '--wt-button-border': 'transparent',
      '--wt-button-color': 'var(--wt-color-text-muted)',
      boxShadow: 'none',
      '&:active': {
        backgroundColor: 'var(--wt-color-elevated)',
        color: 'var(--wt-color-text)',
      },
    },
    '.wt-button--tonal': {
      '--wt-button-bg': 'var(--wt-color-primary-soft)',
      '--wt-button-border': 'transparent',
      '--wt-button-color': 'var(--wt-color-primary)',
      boxShadow: 'none',
      '&:active': {
        backgroundColor: 'var(--wt-color-primary)',
        color: 'var(--wt-color-text-on-primary)',
      },
    },
    '.wt-button--small': {
      minHeight: minHeight['button-sm'] ?? '56rpx',
      padding: `0 ${spacing[3]}`,
      fontSize: fontSizeScale.sm.size,
    },
    '.wt-button--icon': {
      minWidth: getThemeString('width.button-icon', '72rpx'),
      width: getThemeString('width.button-icon', '72rpx'),
      height: getThemeString('height.button-icon', '72rpx'),
      padding: '0',
    },
    '.wt-card': {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[3],
      backgroundColor: 'var(--wt-color-surface)',
      borderRadius: 'var(--wt-radius-lg)',
      border: '1rpx solid var(--wt-color-border)',
      padding: spacing[4],
      boxShadow: 'var(--wt-shadow-sm)',
    },
    '.wt-card__header': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[2],
    },
    '.wt-card__title': {
      fontSize: fontSizeScale.lg.size,
      fontWeight: '600',
      color: 'var(--wt-color-text)',
    },
    '.wt-card__subtitle': {
      fontSize: fontSizeScale.sm.size,
      color: 'var(--wt-color-text-muted)',
    },
    '.wt-card__body': {
      color: 'inherit',
    },
    '.wt-card__footer': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing[2],
    },
    '.wt-badge': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '36rpx',
      padding: `0 ${spacing[2]}`,
      borderRadius: 'var(--wt-radius-pill)',
      border: '1rpx solid transparent',
      fontSize: '22rpx',
      fontWeight: '600',
      backgroundColor: 'var(--wt-color-primary)',
      color: 'var(--wt-color-text-on-primary)',
    },
    '.wt-badge--soft': {
      backgroundColor: 'var(--wt-color-primary-soft)',
      color: 'var(--wt-color-primary)',
    },
    '.wt-badge--outline': {
      backgroundColor: 'transparent',
      borderColor: 'var(--wt-color-primary)',
      color: 'var(--wt-color-primary)',
    },
    '.wt-badge--warning': {
      backgroundColor: 'var(--wt-color-warning)',
      color: 'var(--wt-color-text-on-primary)',
    },
    '.wt-badge--danger': {
      backgroundColor: 'var(--wt-color-danger)',
      color: 'var(--wt-color-text-on-primary)',
    },
    '.wt-badge--success': {
      backgroundColor: 'var(--wt-color-success)',
      color: 'var(--wt-color-text-on-primary)',
    },
    '.wt-tag': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[1],
      minHeight: '44rpx',
      padding: `0 ${spacing[2]}`,
      borderRadius: 'var(--wt-radius-pill)',
      border: '1rpx solid var(--wt-color-border)',
      backgroundColor: 'var(--wt-color-surface)',
      color: 'var(--wt-color-text-muted)',
      fontSize: fontSizeScale.sm.size,
    },
    '.wt-tag__avatar': {
      width: '36rpx',
      height: '36rpx',
      borderRadius: '50%',
      backgroundColor: 'var(--wt-color-primary-soft)',
      color: 'var(--wt-color-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20rpx',
      fontWeight: '600',
    },
    '.wt-tag--active': {
      borderColor: 'var(--wt-color-primary)',
      backgroundColor: 'var(--wt-color-primary-soft)',
      color: 'var(--wt-color-primary)',
    },
    '.wt-tag--danger': {
      borderColor: 'var(--wt-color-danger)',
      backgroundColor: 'var(--wt-color-danger-soft)',
      color: 'var(--wt-color-danger)',
    },
    '.wt-tag--ghost': {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      color: 'var(--wt-color-text-muted)',
    },
    '.wt-input': {
      width: '100%',
      minHeight: minHeight.button ?? '72rpx',
      padding: `0 ${spacing[3]}`,
      borderRadius: 'var(--wt-radius-md)',
      border: '1rpx solid var(--wt-color-border-strong)',
      backgroundColor: 'var(--wt-color-surface)',
      color: 'var(--wt-color-text)',
      fontSize: fontSizeScale.md.size,
      transitionProperty: 'border-color, box-shadow, background-color',
      transitionDuration: '0.2s',
      transitionTimingFunction: 'ease',
      '&::placeholder': {
        color: 'var(--wt-color-text-muted)',
        opacity: '0.7',
      },
      '&:focus': {
        borderColor: 'var(--wt-color-primary)',
        boxShadow: '0 0 0 2rpx rgba(37, 99, 235, 0.18)',
        backgroundColor: 'var(--wt-color-surface)',
      },
      '&.is-error': {
        borderColor: 'var(--wt-color-danger)',
        boxShadow: '0 0 0 2rpx rgba(239, 68, 68, 0.16)',
      },
      '&.is-success': {
        borderColor: 'var(--wt-color-success)',
        boxShadow: '0 0 0 2rpx rgba(22, 163, 74, 0.16)',
      },
      '&.is-disabled, &[disabled]': {
        backgroundColor: 'var(--wt-color-disabled)',
        color: 'var(--wt-color-text-muted)',
        borderColor: 'var(--wt-color-border)',
        boxShadow: 'none',
      },
    },
    '.wt-chip': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[1],
      minHeight: '52rpx',
      padding: `0 ${spacing[2]}`,
      borderRadius: 'var(--wt-radius-pill)',
      backgroundColor: 'var(--wt-color-primary-soft)',
      color: 'var(--wt-color-primary)',
      fontSize: '24rpx',
      fontWeight: '600',
    },
    '.wt-chip--ghost': {
      border: '1rpx solid var(--wt-color-border)',
      backgroundColor: 'transparent',
      color: 'var(--wt-color-text-muted)',
    },
    '.wt-chip--solid': {
      backgroundColor: 'var(--wt-color-primary)',
      color: 'var(--wt-color-text-on-primary)',
      boxShadow: 'var(--wt-shadow-xs)',
    },
    '.wt-avatar': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: getThemeString('width.avatar', '88rpx'),
      height: getThemeString('height.avatar', '88rpx'),
      borderRadius: '50%',
      backgroundColor: 'var(--wt-color-primary-soft)',
      color: 'var(--wt-color-primary)',
      fontSize: '32rpx',
      fontWeight: '600',
    },
    '.wt-avatar--sm': {
      width: getThemeString('width.avatar-sm', '56rpx'),
      height: getThemeString('height.avatar-sm', '56rpx'),
      fontSize: '24rpx',
    },
    '.wt-avatar--lg': {
      width: getThemeString('width.avatar-lg', '120rpx'),
      height: getThemeString('height.avatar-lg', '120rpx'),
      fontSize: '44rpx',
    },
    '.wt-list': {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[2],
    },
    '.wt-list__item': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[2],
      padding: `${spacing[3]} ${spacing[3]}`,
      backgroundColor: 'var(--wt-color-surface)',
      borderRadius: 'var(--wt-radius-md)',
      border: '1rpx solid var(--wt-color-border)',
      '&.wt-list__item--interactive:active': {
        backgroundColor: 'var(--wt-color-primary-soft)',
        borderColor: 'var(--wt-color-primary)',
      },
    },
    '.wt-toolbar': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: minHeight.toolbar ?? '96rpx',
      padding: `0 ${spacing[3]}`,
      backgroundColor: 'var(--wt-color-surface)',
      borderBottom: '1rpx solid var(--wt-color-border)',
    },
    '.wt-toolbar__title': {
      fontSize: '34rpx',
      fontWeight: '600',
    },
    '.wt-toolbar__actions': {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
    '.wt-toast': {
      minWidth: '320rpx',
      maxWidth: '640rpx',
      padding: spacing[4],
      borderRadius: 'var(--wt-radius-lg)',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      color: '#ffffff',
      boxShadow: 'var(--wt-shadow-md)',
    },
    '.wt-toast--success': {
      backgroundColor: 'rgba(22, 163, 74, 0.94)',
    },
    '.wt-toast--danger': {
      backgroundColor: 'rgba(239, 68, 68, 0.94)',
    },
    '.wt-toast--warning': {
      backgroundColor: 'rgba(249, 115, 22, 0.94)',
    },
    '.wt-skeleton': {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'var(--wt-color-surface-muted)',
      borderRadius: 'var(--wt-radius-md)',
      minHeight: '28rpx',
      animation: 'wt-skeleton-pulse 1.5s ease-in-out infinite',
    },
    '.wt-skeleton--dark': {
      backgroundColor: 'rgba(148, 163, 184, 0.2)',
    },
  }
}

function weappTailwindcssUIHandler(api: TailwindPluginAPI) {
  const utilities = {
    ...baseUtilities,
    ...makeSpacingUtilities(api.theme('spacing') as Record<string, string>),
    ...makeFontSizeUtilities(),
  }

  const baseLayer: CssInJs = {
    ':root, page': baseTokens,
    '.wt-theme-dark': darkTokens,
    page: {
      fontFamily: 'var(--wt-font-sans)',
      fontSize: fontSizeScale.md.size,
      color: 'var(--wt-color-text)',
      backgroundColor: 'var(--wt-color-surface-muted)',
      padding: spacingScale[4],
      lineHeight: '1.5',
    },
    'page, view, text, button, input, textarea': {
      boxSizing: 'border-box',
    },
    '*, *::before, *::after': {
      boxSizing: 'inherit',
    },
    'button, navigator': {
      background: 'none',
      border: 'none',
    },
    'button::after': {
      border: 'none',
    },
    image: {
      display: 'block',
      maxWidth: '100%',
    },
    '@keyframes wt-skeleton-pulse': {
      '0%': { opacity: '0.55' },
      '50%': { opacity: '1' },
      '100%': { opacity: '0.55' },
    },
  }

  api.addBase(baseLayer)

  api.addUtilities(utilities)
  api.addComponents(buildComponents(api))
}

export const weappTailwindcssUIPlugin = plugin(weappTailwindcssUIHandler) as unknown as TailwindPlugin

export const weappTailwindcssUIPreset: TailwindConfigLike = {
  theme: {
    fontFamily: fonts,
    fontSize: Object.fromEntries(
      Object.entries(fontSizeScale).map(([key, value]) => [key, [value.size, { lineHeight: value.lineHeight }]]),
    ),
    spacing: spacingScale,
    extend: {
      colors,
      borderRadius: radii,
      boxShadow: shadows,
      minHeight: {
        button: '72rpx',
        'button-sm': '56rpx',
        toolbar: '96rpx',
      },
      minWidth: {
        chip: '72rpx',
        button: '72rpx',
      },
      width: {
        'button-icon': '72rpx',
        toolbar: '96rpx',
        avatar: '88rpx',
        'avatar-sm': '56rpx',
        'avatar-lg': '120rpx',
      },
      height: {
        'button-icon': '72rpx',
        toolbar: '96rpx',
        avatar: '88rpx',
        'avatar-sm': '56rpx',
        'avatar-lg': '120rpx',
      },
      animation: {
        'wt-skeleton': 'wt-skeleton-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        'wt-skeleton-pulse': {
          '0%': { opacity: '0.55' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.55' },
        },
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  safelist: [
    { pattern: /^wt-/ },
  ],
  plugins: [weappTailwindcssUIPlugin],
}

export type { TailwindConfigLike as TailwindConfig }
