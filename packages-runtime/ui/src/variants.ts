import type { VariantProps } from 'tailwind-variants'
import { twMerge } from '@weapp-tailwindcss/merge'
import { tv } from '@weapp-tailwindcss/variants'

export const button = tv({
  base: 'wt-button',
  variants: {
    tone: {
      primary: '',
      secondary: 'wt-button--secondary',
      success: 'wt-button--success',
      danger: 'wt-button--danger',
    },
    appearance: {
      solid: '',
      outline: 'wt-button--outline',
      ghost: 'wt-button--ghost',
      tonal: 'wt-button--tonal',
    },
    size: {
      md: '',
      sm: 'wt-button--small',
      icon: 'wt-button--icon',
    },
    disabled: {
      true: 'is-disabled',
    },
  },
  defaultVariants: {
    tone: 'primary',
    appearance: 'solid',
    size: 'md',
  },
})

export const badge = tv({
  base: 'wt-badge',
  variants: {
    tone: {
      primary: '',
      soft: 'wt-badge--soft',
      outline: 'wt-badge--outline',
      success: 'wt-badge--success',
      warning: 'wt-badge--warning',
      danger: 'wt-badge--danger',
    },
  },
  defaultVariants: {
    tone: 'primary',
  },
})

export const chip = tv({
  base: 'wt-chip',
  variants: {
    tone: {
      primary: '',
      solid: 'wt-chip--solid',
      ghost: 'wt-chip--ghost',
    },
  },
  defaultVariants: {
    tone: 'primary',
  },
})

export const card = tv({
  base: 'wt-card',
  variants: {
    shadow: {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
    },
    border: {
      muted: '',
      strong: 'border-border-strong',
    },
  },
  defaultVariants: {
    shadow: 'sm',
    border: 'muted',
  },
})

export const input = tv({
  base: 'wt-input',
  variants: {
    state: {
      default: '',
      success: 'is-success',
      error: 'is-error',
    },
    disabled: {
      true: 'is-disabled',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

export const avatar = tv({
  base: 'wt-avatar',
  variants: {
    size: {
      sm: 'wt-avatar--sm',
      md: '',
      lg: 'wt-avatar--lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const toolbar = tv({
  base: 'wt-toolbar',
  variants: {
    elevated: {
      true: 'shadow-xs',
      false: '',
    },
    borderless: {
      true: 'border-b-0',
      false: '',
    },
  },
  defaultVariants: {
    elevated: false,
    borderless: false,
  },
})

export const toast = tv({
  base: 'wt-toast',
  variants: {
    tone: {
      neutral: '',
      success: 'wt-toast--success',
      warning: 'wt-toast--warning',
      danger: 'wt-toast--danger',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})

export const list = tv({
  base: 'wt-list',
})

export const listItem = tv({
  base: 'wt-list__item',
  variants: {
    interactive: {
      true: 'wt-list__item--interactive',
    },
  },
  defaultVariants: {
    interactive: false,
  },
})

export const tag = tv({
  base: 'wt-tag',
  variants: {
    tone: {
      default: '',
      active: 'wt-tag--active',
      danger: 'wt-tag--danger',
      ghost: 'wt-tag--ghost',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

export const skeleton = tv({
  base: 'wt-skeleton',
  variants: {
    tone: {
      default: '',
      dark: 'wt-skeleton--dark',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

type ClassValue = Parameters<typeof twMerge>[number]

export const mergeClassNames = (...values: ClassValue[]) => twMerge(...values)

export type ButtonVariants = VariantProps<typeof button>
export type BadgeVariants = VariantProps<typeof badge>
export type ChipVariants = VariantProps<typeof chip>
export type CardVariants = VariantProps<typeof card>
export type InputVariants = VariantProps<typeof input>
export type AvatarVariants = VariantProps<typeof avatar>
export type ToolbarVariants = VariantProps<typeof toolbar>
export type ToastVariants = VariantProps<typeof toast>
export type ListItemVariants = VariantProps<typeof listItem>
export type TagVariants = VariantProps<typeof tag>
export type SkeletonVariants = VariantProps<typeof skeleton>
