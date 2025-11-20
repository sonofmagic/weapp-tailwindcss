import { createRequire } from 'node:module'
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
  const rewrittenCss = rewriteTailwindcssImportStatements(css)
  const tailwindcss = (await import('@tailwindcss/postcss')).default
  return await postcss([
    tailwindcss({
      base,
    }),
    postcssRemoveComment,
    ...postcssPlugins,
  ])
    .process(rewrittenCss, {
      from: 'style.css',
    })
}

const require = createRequire(import.meta.url)
const tailwindcssImportRE = /^tailwindcss(?:\/.*)?$/
const tailwindcssCssImportStatementRE = /(@import\s+(?:url\(\s*)?)(["'])(tailwindcss(?:\/[^"']*)?\$?)(\2\s*\)?)/gi

function resolveTailwindcssImport(id: string) {
  if (!tailwindcssImportRE.test(id)) {
    return null
  }

  const normalized = id === 'tailwindcss$' ? 'tailwindcss' : id
  if (normalized === 'tailwindcss') {
    return require.resolve('weapp-tailwindcss/index.css')
  }
  if (normalized.startsWith('tailwindcss/')) {
    const subpath = normalized.slice('tailwindcss/'.length)
    try {
      return require.resolve(`weapp-tailwindcss/${subpath}`)
    }
    catch {
      return null
    }
  }
  return null
}

function rewriteTailwindcssImportStatements(source: string) {
  let hasReplacements = false
  const rewritten = source.replace(
    tailwindcssCssImportStatementRE,
    (full, prefix: string, quote: string, specifier: string, suffix: string) => {
      const replacement = resolveTailwindcssImport(specifier)
      if (!replacement) {
        return full
      }
      hasReplacements = true
      return `${prefix}${quote}${replacement}${suffix}`
    },
  )
  return hasReplacements ? rewritten : source
}
