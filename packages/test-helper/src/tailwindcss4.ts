import defu from 'defu'
import postcss from 'postcss'
import { postcssRemoveComment } from './removeComment'

export interface IGenerateCssOptions {
  css?: string
  postcssPlugins?: postcss.AcceptedPlugin[]
}

export async function generateCss(base: string, options?: IGenerateCssOptions) {
  const { css, postcssPlugins } = defu(options, {
    css: '@import "weapp-tailwindcss";',
    postcssPlugins: [],
  })
  const tailwindcss = (await import('@tailwindcss/postcss')).default
  return await postcss([
    tailwindcss({
      base,
    }),
    postcssRemoveComment,
    ...postcssPlugins,
  ])
    .process(css, {
      from: 'style.css',
    })
}
