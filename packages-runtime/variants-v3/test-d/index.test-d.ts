import type { VariantProps } from '..'
import {
  expectAssignable,
  expectError,
  expectNotAssignable,
  expectType,
} from 'tsd'
import {
  cn,
  cnBase,
  createTV,
  tv,
} from '..'

expectType<string | undefined>(cnBase('px-2', false))
expectType<string | undefined>(cn('px-2', undefined)())

const button = tv({
  base: 'inline-flex',
  variants: {
    intent: {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
    },
    size: {
      sm: 'text-sm',
      lg: 'text-lg',
    },
    rounded: {
      true: 'rounded-full',
      false: 'rounded-none',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

expectType<string>(button())
expectType<string>(button({ class: 'px-2' }))
expectError(button({ class: 'px-2', className: 'py-2' }))
expectError(button({ intent: 'tertiary' }))
expectError(button({ rounded: 'true' }))
expectError(button({ size: 'xl' }))

type ButtonVariantProps = VariantProps<typeof button>
const buttonVariantProps: ButtonVariantProps = {
  intent: 'primary',
  rounded: true,
}

expectType<{
  intent?: 'primary' | 'secondary' | undefined
  size?: 'sm' | 'lg' | undefined
  rounded?: boolean | undefined
}>(buttonVariantProps)
expectNotAssignable<ButtonVariantProps>({ class: 'px-2' })
expectNotAssignable<ButtonVariantProps>({ className: 'py-2' })

const baseButton = tv({
  variants: {
    tone: {
      solid: 'bg-black',
      soft: 'bg-gray-200',
    },
  },
})

const extendedButton = tv({
  extend: baseButton,
  variants: {
    size: {
      sm: 'text-sm',
      lg: 'text-lg',
    },
  },
})

type ExtendedButtonProps = VariantProps<typeof extendedButton>
expectAssignable<ExtendedButtonProps>({ tone: 'solid', size: 'sm' })
expectError(extendedButton({ tone: 'ghost' }))

const card = tv({
  base: 'card',
  slots: {
    root: 'card-root',
    icon: 'card-icon',
  },
  variants: {
    size: {
      sm: { root: 'text-sm', icon: 'h-4' },
      lg: { root: 'text-lg', icon: 'h-6' },
    },
  },
})

const cardSlots = card({ size: 'sm' })
expectType<string>(cardSlots.base())
expectType<string>(cardSlots.root())
expectType<string>(cardSlots.icon())
expectType<string>(cardSlots.root({ size: 'lg' }))
expectError(cardSlots.root({ size: 'xl' }))

const createResponsive = createTV({ responsiveVariants: ['sm', 'md'] as const })
const responsiveButton = createResponsive({
  variants: {
    size: {
      sm: 'text-sm',
      lg: 'text-lg',
    },
  },
})

expectType<string>(responsiveButton())

type ResponsiveProps = VariantProps<typeof responsiveButton>
expectAssignable<ResponsiveProps>({ size: 'sm' })
expectAssignable<ResponsiveProps>({ size: { initial: 'sm', md: 'lg' } })
expectError(responsiveButton({ size: { lg: 'sm' } }))
