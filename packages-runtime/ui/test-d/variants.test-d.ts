/* eslint-disable antfu/no-import-dist */
import type {
  AvatarVariants,
  BadgeVariants,
  ButtonVariants,
  ToolbarVariants,
} from '../dist/variants.js'
import {
  expectAssignable,
  expectError,
  expectType,
} from 'tsd'
import {
  avatar,
  badge,
  button,
  mergeClassNames,
  toolbar,
} from '../dist/variants.js'

expectType<string>(button())
expectType<string>(button({ class: 'px-4' }))
expectType<string>(mergeClassNames('px-2', false, undefined, 'px-4'))
expectType<string>(avatar({ size: 'lg' }))
expectType<string>(badge({ tone: 'danger' }))
expectType<string>(toolbar({ elevated: true }))

expectAssignable<ButtonVariants>({
  tone: 'primary',
  appearance: 'outline',
  size: 'sm',
  disabled: true,
})
expectAssignable<BadgeVariants>({ tone: 'soft' })
expectAssignable<AvatarVariants>({ size: 'md' })
expectAssignable<ToolbarVariants>({ borderless: false })

expectError<ButtonVariants>({ tone: 'ghost' })
expectError<ButtonVariants>({ size: 'lg' })
expectError<BadgeVariants>({ tone: 'info' })
