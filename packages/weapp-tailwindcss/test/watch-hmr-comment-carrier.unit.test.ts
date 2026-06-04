import { describe, expect, it } from 'vitest'
import { buildDemoBaseCases } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/base'
import { buildDemoExtendedCases } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/extended'
import {
  mutateScriptByDataAnchorWithCommentCarrier,
  mutateTsxScriptByReturnAnchorWithCommentCarrier,
  mutateVueScriptSetupArrayByAnchorWithCommentCarrier,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/text'

const payload = {
  marker: 'tw-watch-comment-marker',
  classLiteral: 'text-[#123456] bg-[#0f0f0f]',
  classVariableName: '__twWatchClass',
}

describe('watch-hmr comment-carrier helpers', () => {
  it('injects comment-carried classes into data-anchor scripts while keeping marker output', () => {
    const source = `Page({
  data: {
    count: 1,
  },
})`

    const mutated = mutateScriptByDataAnchorWithCommentCarrier(source, '  data: {', payload)

    expect(mutated).toContain(`/* ${payload.classLiteral} */`)
    expect(mutated).toContain(`__twWatchScriptCommentMarker: '${payload.marker}'`)
    expect(mutated).not.toContain(`'${payload.classLiteral}'`)
  })

  it('injects comment-carried classes into tsx return blocks while keeping marker output', () => {
    const source = `export default function Page() {
  return (
    <>
    </>
  )
}`

    const mutated = mutateTsxScriptByReturnAnchorWithCommentCarrier(source, payload)

    expect(mutated).toContain(`/* ${payload.classLiteral} */`)
    expect(mutated).toContain(`const __twWatchScriptCommentMarker = '${payload.marker}'`)
    expect(mutated).toContain(`<View>${payload.marker}-script-comment</View>`)
    expect(mutated).not.toContain(`className='${payload.classLiteral}'`)
  })

  it('injects comment-carried classes into vue script setup arrays while keeping marker output', () => {
    const source = `<template>
  <view class="content">
    <view>demo</view>
  </view>
</template>

<script setup lang="ts">
const classArray = [
  'text-sm',
]
</script>`

    const mutated = mutateVueScriptSetupArrayByAnchorWithCommentCarrier(
      source,
      'const classArray = [',
      payload,
    )

    expect(mutated).toContain(`/* ${payload.classLiteral} */`)
    expect(mutated).toContain(`const __twWatchScriptCommentMarker = '${payload.marker}'`)
    expect(mutated).toContain('<view hidden>{{ __twWatchScriptCommentMarker }}</view>')
    expect(mutated).not.toContain(`'${payload.classLiteral}'`)
  })

  it('enables comment-carrier mutation for the weapp-vite demo case', () => {
    const cases = buildDemoBaseCases('/virtual/workspace')
    const weappViteCase = cases.find(item => item.name === 'weapp-vite-tailwindcss-v3')

    expect(weappViteCase?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
  })

  it('disables comment-carrier mutation for the taro-vite-react-tailwindcss-v4 demo case', () => {
    const cases = buildDemoExtendedCases('/virtual/workspace')
    const taroViteCase = cases.find(item => item.name === 'taro-vite-react-tailwindcss-v4')

    expect(taroViteCase?.scriptMutation.mutateCommentCarrier).toBeUndefined()
  })

  it('disables comment-carrier mutation for the taro-vite-react-tailwindcss-v3 demo case', () => {
    const cases = buildDemoExtendedCases('/virtual/workspace')
    const taroAppViteCase = cases.find(item => item.name === 'taro-vite-react-tailwindcss-v3')

    expect(taroAppViteCase?.scriptMutation.mutateCommentCarrier).toBeUndefined()
  })

  it('enables comment-carrier mutation for the taro-webpack-react-tailwindcss-v3 demo case', () => {
    const cases = buildDemoBaseCases('/virtual/workspace')
    const taroWebpackCase = cases.find(item => item.name === 'taro-webpack-react-tailwindcss-v3')

    expect(taroWebpackCase?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
  })

  it('enables comment-carrier mutation for the taro-webpack-react-tailwindcss-v4 demo case', () => {
    const cases = buildDemoExtendedCases('/virtual/workspace')
    const taroWebpackCase = cases.find(item => item.name === 'taro-webpack-react-tailwindcss-v4')

    expect(taroWebpackCase?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
  })

  it('enables comment-carrier mutation for the uni-app vite and mpx demo cases', () => {
    const baseCases = buildDemoBaseCases('/virtual/workspace')
    const extendedCases = buildDemoExtendedCases('/virtual/workspace')

    expect(baseCases.find(item => item.name === 'mpx-tailwindcss-v3')?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
    expect(extendedCases.find(item => item.name === 'uni-app-vite-tailwindcss-v3')?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
  })

  it('enables comment-carrier mutation for the v4 demo cases', () => {
    const baseCases = buildDemoBaseCases('/virtual/workspace')
    const extendedCases = buildDemoExtendedCases('/virtual/workspace')

    expect(extendedCases.find(item => item.name === 'mpx-tailwindcss-v4')?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
    expect(baseCases.find(item => item.name === 'weapp-vite-tailwindcss-v4')?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
  })
})
