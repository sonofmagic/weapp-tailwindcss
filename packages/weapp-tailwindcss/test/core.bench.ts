import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { bench, describe } from 'vitest'
import { getCompilerContext } from '@/context'
import { createContext } from '@/core'
import { collectRuntimeClassSet, createTailwindPatchPromise } from '@/tailwindcss/runtime'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function readFixture(...segments: string[]) {
  return fs.readFileSync(path.resolve(__dirname, 'fixtures', ...segments), 'utf8')
}

const cssMain = readFixture('css', 'v4-default.css')
const cssMpx = readFixture('css', 'mpx-tailwindcss-v4.1.17.css')
const wxmlTdesign = readFixture('wxml', 'mpx-tdesign-button.wxml')
const jsLarge = readFixture('js', 'taro-lottie-miniprogram-build.js')
const jsMedium = readFixture('js', 'taro-vue3-test-build-dist.js')

const benchOptions = { time: 300 }
const coldOptions = { time: 180 }

const runtimeSetPromise = prepareRuntimeSet()
const warmContextPromise = prepareWarmContext()

async function prepareRuntimeSet() {
  const ctx = getCompilerContext()
  await createTailwindPatchPromise(ctx.twPatcher)
  return collectRuntimeClassSet(ctx.twPatcher, { force: true })
}

async function prepareWarmContext() {
  const ctx = createContext()
  await ctx.transformWxss(cssMain, { isMainChunk: true })
  return ctx
}

describe('weapp-tailwindcss runtime benchmarks', () => {
  bench(
    'wxss transform (v4 default bundle)',
    async () => {
      const ctx = await warmContextPromise
      await ctx.transformWxss(cssMain, { isMainChunk: true })
    },
    benchOptions,
  )

  bench(
    'wxss transform (mpx component bundle)',
    async () => {
      const ctx = await warmContextPromise
      await ctx.transformWxss(cssMpx)
    },
    benchOptions,
  )

  bench(
    'wxml transform (tdesign button)',
    async () => {
      const ctx = await warmContextPromise
      const runtimeSet = await runtimeSetPromise
      await ctx.transformWxml(wxmlTdesign, { runtimeSet })
    },
    benchOptions,
  )

  bench(
    'js transform (large bundle, auto runtime discovery)',
    async () => {
      const ctx = await warmContextPromise
      await ctx.transformJs(jsLarge)
    },
    benchOptions,
  )

  bench(
    'js transform (large bundle, reused runtime set)',
    async () => {
      const ctx = await warmContextPromise
      const runtimeSet = await runtimeSetPromise
      await ctx.transformJs(jsLarge, { runtimeSet })
    },
    benchOptions,
  )

  bench(
    'end-to-end pipeline (cold context bootstrap)',
    async () => {
      const ctx = createContext()
      await ctx.transformWxss(cssMpx, { isMainChunk: true })
      await ctx.transformWxml(wxmlTdesign)
      await ctx.transformJs(jsMedium)
    },
    coldOptions,
  )
})
