import type { Config } from 'tailwindcss'
import defu from 'defu'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
// @tailwind components;
export interface IGetCssOptions {
  twConfig?: Partial<Config>
  css?: string
  postcssPlugins?: postcss.AcceptedPlugin[]
  isContentGlob?: boolean
}

export async function getCss(content: string | string[], options: IGetCssOptions = {}) {
  const { css, postcssPlugins, twConfig, isContentGlob } = defu(options, {
    css: '@tailwind utilities;',
    postcssPlugins: [],
    twConfig: {},
  })
  if (typeof content === 'string') {
    content = [content]
  }
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
    {
      Comment(comment, _helper) {
        comment.remove()
      },
      postcssPlugin: 'remove-all-comment',
    },
    ...postcssPlugins,
  ])
  const res = await processor.process(css, {
    from: 'index.css',
    to: 'index.css',
  })
  return res
}
