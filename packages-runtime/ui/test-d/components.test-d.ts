/* eslint-disable antfu/no-import-dist */
import type { FC } from 'react'
import type {
  BadgeProps,
  ButtonProps,
  FlexProps,
  InputProps,
  TabsProps,
} from '../dist/components/index.js'
import {
  expectAssignable,
  expectError,
  expectType,
} from 'tsd'
import {
  BadgeTaro,
  ButtonTaro,
  Flex,
  Input,
  Tabs,
} from '../dist/components/index.js'

expectAssignable<ButtonProps>({
  tone: 'primary',
  appearance: 'ghost',
  size: 'sm',
  disabled: true,
})
expectAssignable<InputProps>({
  state: 'error',
  value: 'hello',
  onInput: value => value,
})
expectAssignable<BadgeProps>({ tone: 'danger', count: 1 })
expectAssignable<FlexProps>({ className: 'wt-flex' })
expectAssignable<TabsProps>({ className: 'wt-tabs' })

expectType<FC<ButtonProps>>(ButtonTaro)
expectType<FC<InputProps>>(Input)
expectType<FC<BadgeProps>>(BadgeTaro)
expectType<FC<FlexProps>>(Flex)
expectType<FC<TabsProps>>(Tabs)

expectError<ButtonProps>({ tone: 'dangerous' })
expectError<InputProps>({ state: 'warning' })
