import postcss from 'postcss'
import tailwindcss, { type Config } from 'tailwindcss'
import defu from 'defu'
// @tailwind components;
export interface IGetCssOptions {
  twConfig?: Partial<Config>
  css?: string
  postcssPlugins?: postcss.AcceptedPlugin[]
}

export async function getCss(content: string | string[], options: IGetCssOptions = {}) {
  const { css, postcssPlugins, twConfig } = defu(options, {
    css: '@tailwind utilities;',
    postcssPlugins: [],
    twConfig: {},
  })
  if (typeof content === 'string') {
    content = [content]
  }
  const processor = postcss([
    tailwindcss({
      content: content.map((x) => {
        return {
          raw: x,
        }
      }),
      ...twConfig,
    }),
    {
      Comment(comment, helper) {
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
