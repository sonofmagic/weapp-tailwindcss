import type { VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { createTV } from 'tailwind-variants'

const tv = createTV({
  twMerge: false,
})

function withMerge<T extends (...args: any[]) => string>(variant: T): T {
  const merged = ((options?: Parameters<T>[0]) => {
    const value = variant(options)
    if (typeof value !== 'string') {
      return value as string
    }
    return twMerge(value)
  }) as T

  return Object.assign(merged, variant)
}

export const button = withMerge(
  tv({
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
  }),
)

export const badge = withMerge(
  tv({
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
  }),
)

export const chip = withMerge(
  tv({
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
  }),
)

export const card = withMerge(
  tv({
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
  }),
)

export const input = withMerge(
  tv({
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
  }),
)

export const avatar = withMerge(
  tv({
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
  }),
)

export const toolbar = withMerge(
  tv({
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
  }),
)

export const toast = withMerge(
  tv({
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
  }),
)

export const list = withMerge(
  tv({
    base: 'wt-list',
  }),
)

export const listItem = withMerge(
  tv({
    base: 'wt-list__item',
    variants: {
      interactive: {
        true: 'wt-list__item--interactive',
      },
    },
    defaultVariants: {
      interactive: false,
    },
  }),
)

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
