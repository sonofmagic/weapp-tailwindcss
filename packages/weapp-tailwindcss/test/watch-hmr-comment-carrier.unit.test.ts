import { describe, expect, it } from 'vitest'
import { buildDemoBaseCases } from '../scripts/watch-hmr-regression/cases/demo/base'
import { buildDemoExtendedCases } from '../scripts/watch-hmr-regression/cases/demo/extended'
import {
  mutateScriptByDataAnchorWithCommentCarrier,
  mutateTsxScriptByReturnAnchorWithCommentCarrier,
  mutateVueScriptSetupArrayByAnchorWithCommentCarrier,
} from '../scripts/watch-hmr-regression/text'

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
    const weappViteCase = cases.find(item => item.name === 'weapp-vite')

    expect(weappViteCase?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
  })

  it('enables comment-carrier mutation for the taro-vite-tailwindcss-v4 demo case', () => {
    const cases = buildDemoExtendedCases('/virtual/workspace')
    const taroViteCase = cases.find(item => item.name === 'taro-vite-tailwindcss-v4')

    expect(taroViteCase?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
  })

  it('enables comment-carrier mutation for the taro-app-vite demo case', () => {
    const cases = buildDemoExtendedCases('/virtual/workspace')
    const taroAppViteCase = cases.find(item => item.name === 'taro-app-vite')

    expect(taroAppViteCase?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
  })

  it('enables comment-carrier mutation for the taro-webpack-tailwindcss-v4 demo case', () => {
    const cases = buildDemoExtendedCases('/virtual/workspace')
    const taroWebpackCase = cases.find(item => item.name === 'taro-webpack-tailwindcss-v4')

    expect(taroWebpackCase?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
  })

  it('enables comment-carrier mutation for the uni-app, uni-app-vue3-vite and mpx demo cases', () => {
    const baseCases = buildDemoBaseCases('/virtual/workspace')
    const extendedCases = buildDemoExtendedCases('/virtual/workspace')

    expect(baseCases.find(item => item.name === 'uni')?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
    expect(baseCases.find(item => item.name === 'mpx')?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
    expect(extendedCases.find(item => item.name === 'uni-app-vue3-vite')?.scriptMutation.mutateCommentCarrier).toBeTypeOf('function')
  })
})
