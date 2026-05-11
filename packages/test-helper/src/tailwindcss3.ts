import type { Config } from 'tailwindcss'
import defu from 'defu'
import postcss from 'postcss'
import { TailwindcssPatcher } from 'tailwindcss-patch'
import { postcssRemoveComment } from './removeComment'

export interface IGenerateCssOptions {
  twConfig?: Partial<Config>
  css?: string
  postcssPlugins?: postcss.AcceptedPlugin[]
  isContentGlob?: boolean
}

let runtimeReadyPromise: Promise<void> | undefined

function ensureTailwindcss3RuntimeReady() {
  runtimeReadyPromise ??= new TailwindcssPatcher({
    apply: {
      exposeContext: true,
      extendLengthUnits: true,
    },
    cache: {
      driver: 'memory',
    },
    tailwindcss: {
      packageName: 'tailwindcss',
      postcssPlugin: 'tailwindcss',
      version: 3,
    },
  }).patch().then(() => undefined)
  return runtimeReadyPromise
}

export async function generateCss(content: string | string[], options: IGenerateCssOptions = {}) {
  await ensureTailwindcss3RuntimeReady()

  // 默认执行顺序：@tailwind base;@tailwind components;@tailwind utilities;
  const { css, postcssPlugins, twConfig, isContentGlob } = defu(options, {
    css: '@tailwind utilities;',
    postcssPlugins: [],
    twConfig: {},
  })
  if (typeof content === 'string') {
    content = [content]
  }
  const tailwindcss = (await import('tailwindcss')).default
  const processor = postcss([
    tailwindcss({
      content: isContentGlob
        ? content
        : content.map((x) => {
            return {
              raw: x,
            }
          }),
      ...twConfig,
    }) as postcss.Plugin,
    postcssRemoveComment,
    ...postcssPlugins,
  ])
  const res = await processor.process(css, {
    from: 'index.css',
    to: 'index.css',
  })
  return res
}
