import type { VariantProps } from '..'
import {
  expectAssignable,
  expectError,
  expectNotAssignable,
  expectType,
} from 'tsd'
import { cva } from '..'

const button = cva('inline-flex', {
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
    intent: 'primary',
    size: 'sm',
  },
  compoundVariants: [
    {
      intent: 'primary',
      size: 'lg',
      class: 'shadow',
    },
    {
      intent: 'secondary',
      rounded: true,
      className: 'ring-1',
    },
  ],
})

expectType<string>(button())
expectType<string>(button({ class: 'px-4' }))
expectType<string>(button({ intent: null }))
expectError(button({ class: 'px-4', className: 'py-2' }))
expectError(button({ intent: 'tertiary' }))
expectError(button({ rounded: 'true' }))
expectError(button({ size: 'xl' }))

type ButtonVariantProps = VariantProps<typeof button>
const buttonVariantProps: ButtonVariantProps = {
  intent: 'secondary',
  rounded: false,
}

expectType<{
  intent?: 'primary' | 'secondary' | null | undefined
  size?: 'sm' | 'lg' | null | undefined
  rounded?: boolean | null | undefined
}>(buttonVariantProps)
expectAssignable<ButtonVariantProps>({ size: null })
expectAssignable<ButtonVariantProps>({ rounded: true })
expectNotAssignable<ButtonVariantProps>({ class: 'px-4' })
expectNotAssignable<ButtonVariantProps>({ className: 'py-2' })
