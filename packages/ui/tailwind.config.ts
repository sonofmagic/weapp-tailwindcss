/* eslint-disable style/quote-props */
import type { Config } from 'tailwindcss'

const spacingScale = {
  0: '0rpx',
  1: '8rpx',
  2: '16rpx',
  3: '24rpx',
  4: '32rpx',
  5: '40rpx',
  6: '48rpx',
  8: '64rpx',
}

const config = {
  prefix: '',
  content: [
    './src/**/*.{ts,js,jsx,tsx,css}',
    './test/**/*.{ts,js,jsx,tsx}',
  ],
  safelist: [],
  theme: {
    fontFamily: {
      sans: ['PingFang SC', 'Helvetica Neue', 'Segoe UI', 'Arial', 'sans-serif'],
      mono: ['SFMono-Regular', 'Menlo', 'Roboto Mono', 'monospace'],
    },
    fontSize: {
      xs: ['22rpx', { lineHeight: '1.45' }],
      sm: ['24rpx', { lineHeight: '1.45' }],
      md: ['28rpx', { lineHeight: '1.5' }],
      base: ['28rpx', { lineHeight: '1.5' }],
      lg: ['32rpx', { lineHeight: '1.5' }],
      xl: ['40rpx', { lineHeight: '1.35' }],
      '2xl': ['48rpx', { lineHeight: '1.25' }],
    },
    spacing: spacingScale,
    extend: {
      colors: {
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
      },
      borderRadius: {
        none: '0',
        sm: '12rpx',
        DEFAULT: '16rpx',
        lg: '24rpx',
        full: '999rpx',
      },
      boxShadow: {
        xs: '0 2rpx 6rpx rgba(15, 23, 42, 0.04)',
        sm: '0 6rpx 14rpx rgba(15, 23, 42, 0.08)',
        md: '0 10rpx 26rpx rgba(15, 23, 42, 0.12)',
      },
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
} satisfies Config

export default config
