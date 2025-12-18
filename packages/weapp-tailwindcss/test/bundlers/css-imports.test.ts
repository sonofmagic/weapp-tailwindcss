import { Buffer } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import { rewriteTailwindcssImportsInCode } from '@/bundlers/shared/css-imports'
import { transformCssImportRewriteSource } from '@/bundlers/webpack/loaders/weapp-tw-css-import-rewrite-loader'

function joinPosixPath(base: string, subpath: string) {
  return base.endsWith('/') ? `${base}${subpath}` : `${base}/${subpath}`
}

describe('bundlers/shared css-imports', () => {
  const pkgDir = '/virtual/weapp-tailwindcss'

  it('rewrites tailwindcss import to weapp entry for mpx', () => {
    const code = '@import "tailwindcss";'
    const rewritten = rewriteTailwindcssImportsInCode(code, pkgDir, {
      join: joinPosixPath,
      appType: 'mpx',
    })
    expect(rewritten).toBe('@import "weapp-tailwindcss/index.css";')
  })

  it('keeps tailwindcss subpath resolution for mpx', () => {
    const code = '@import "tailwindcss/base";'
    const rewritten = rewriteTailwindcssImportsInCode(code, pkgDir, {
      join: joinPosixPath,
      appType: 'mpx',
    })
    expect(rewritten).toBe(`@import "${pkgDir}/base";`)
  })

  it('rewrites buffer sources in loader for mpx', () => {
    const buf = Buffer.from('@import "tailwindcss";')
    const rewritten = transformCssImportRewriteSource(buf, {
      rewriteCssImports: {
        pkgDir,
        appType: 'mpx',
      },
    })
    expect(rewritten).toBe('@import "weapp-tailwindcss/index.css";')
  })

  it('rewrites tailwindcss import to weapp entry for non-mpx', () => {
    const code = '@import "tailwindcss";'
    const rewritten = rewriteTailwindcssImportsInCode(code, pkgDir, { join: joinPosixPath })
    expect(rewritten).toBe('@import "weapp-tailwindcss/index.css";')
  })
})
