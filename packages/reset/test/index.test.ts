import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const pkgDir = path.resolve(import.meta.dirname, '..')

function readFile(relativePath: string) {
  return fs.readFileSync(path.join(pkgDir, relativePath), 'utf8')
}

function collectBlocks(
  code: string,
  startToken: string,
  endToken = '#endif',
) {
  const startIndexes: number[] = []
  const endIndexes: number[] = []
  let cursor = 0

  while (true) {
    const index = code.indexOf(startToken, cursor)
    if (index === -1) {
      break
    }
    startIndexes.push(index)
    cursor = index + startToken.length
  }

  cursor = 0
  while (true) {
    const index = code.indexOf(endToken, cursor)
    if (index === -1) {
      break
    }
    endIndexes.push(index)
    cursor = index + endToken.length
  }

  return { startIndexes, endIndexes }
}

function expectConditionalBlocksToBeBalanced(
  relativePath: string,
  startToken: string,
  endToken = '#endif',
) {
  const code = readFile(relativePath)
  const { startIndexes, endIndexes } = collectBlocks(code, startToken, endToken)

  expect(startIndexes.length).toBeGreaterThan(0)
  expect(endIndexes.length).toBeGreaterThanOrEqual(startIndexes.length)

  for (const startIndex of startIndexes) {
    const matchingEndIndex = endIndexes.find(index => index > startIndex)
    expect(matchingEndIndex).toBeDefined()
    const inner = code.slice(startIndex, matchingEndIndex)
    expect(inner).toMatch(/\*\/\s*\n[\s\S]*?[{:]/)
  }
}

describe('@weapp-tailwindcss/reset', () => {
  it('exports wildcard subpaths for static css files', () => {
    const pkg = JSON.parse(readFile('package.json')) as {
      exports: Record<string, string>
      files: string[]
    }

    expect(pkg.exports['./*']).toBe('./*')
    expect(pkg.files).toEqual(expect.arrayContaining(['uni-app', 'taro']))
  })

  it('provides button-after reset for both platforms', () => {
    expect(readFile('uni-app/button-after.css')).toContain('button::after')
    expect(readFile('uni-app/button-after.css')).toContain('all: unset')
    expect(readFile('taro/button-after.css')).toContain('button::after')
    expect(readFile('taro/button-after.css')).toContain('all: unset')
  })

  it('ships normalize, modern-normalize and eric-meyer for both platforms', () => {
    expect(readFile('uni-app/normalize.css')).toContain(':where(html)')
    expect(readFile('taro/normalize.css')).toContain(':where(html)')
    expect(readFile('uni-app/modern-normalize.css')).toContain(
      'modern-normalize v2.0.0',
    )
    expect(readFile('taro/modern-normalize.css')).toContain(
      'modern-normalize v2.0.0',
    )
    expect(readFile('uni-app/eric-meyer.css')).toContain(
      'meyerweb.com/eric/tools/css/reset',
    )
    expect(readFile('taro/eric-meyer.css')).toContain(
      'meyerweb.com/eric/tools/css/reset',
    )
  })

  it('ships sanitize styles and asset helpers for both platforms', () => {
    expect(readFile('uni-app/sanitize/sanitize.css')).toContain(
      'background-repeat: no-repeat',
    )
    expect(readFile('taro/sanitize/sanitize.css')).toContain(
      'background-repeat: no-repeat',
    )
    expect(readFile('uni-app/sanitize/assets.css')).toContain('max-width: 100%')
    expect(readFile('taro/sanitize/assets.css')).toContain('max-width: 100%')
  })

  it('keeps tailwind-compat without button background reset', () => {
    const uniCompat = readFile('uni-app/tailwind-compat.css')
    const taroCompat = readFile('taro/tailwind-compat.css')

    expect(uniCompat).toContain(
      'Will affect the button style of most component libraries',
    )
    expect(uniCompat).not.toContain('background-color: transparent; /* 2 */')
    expect(taroCompat).toContain(
      'Will affect the button style of most component libraries',
    )
    expect(taroCompat).not.toContain('background-color: transparent; /* 2 */')
  })

  it('keeps tailwind reset image rules for both platforms', () => {
    const uniTailwind = readFile('uni-app/tailwind.css')
    const taroTailwind = readFile('taro/tailwind.css')

    expect(uniTailwind).toContain('max-width: 100%')
    expect(uniTailwind).toContain('image,')
    expect(taroTailwind).toContain('max-width: 100%')
    expect(taroTailwind).toContain('image,')
  })

  it('keeps uni-app conditional compilation markers balanced', () => {
    for (const file of [
      'uni-app/tailwind.css',
      'uni-app/tailwind-compat.css',
      'uni-app/normalize.css',
      'uni-app/modern-normalize.css',
      'uni-app/eric-meyer.css',
      'uni-app/sanitize/sanitize.css',
      'uni-app/sanitize/assets.css',
    ]) {
      expectConditionalBlocksToBeBalanced(file, '#ifdef H5')
      expectConditionalBlocksToBeBalanced(file, '#ifndef H5')
    }
  })

  it('keeps taro conditional compilation markers balanced', () => {
    for (const file of [
      'taro/tailwind.css',
      'taro/tailwind-compat.css',
      'taro/normalize.css',
      'taro/modern-normalize.css',
      'taro/eric-meyer.css',
      'taro/sanitize/sanitize.css',
      'taro/sanitize/assets.css',
    ]) {
      expectConditionalBlocksToBeBalanced(file, '#ifdef  h5')
      expectConditionalBlocksToBeBalanced(file, '#ifndef  h5')
    }
  })

  it('locks a few critical conditional wrappers to prevent comment drift', () => {
    expect(readFile('uni-app/tailwind.css')).toContain(`/* #ifdef H5 */
*,
::before,
::after {
  box-sizing: border-box; /* 1 */
`)
    expect(readFile('uni-app/tailwind.css')).toContain(`/* #endif */
/* #ifndef H5 */
page,
cover-image,
`)
    expect(readFile('taro/tailwind.css')).toContain(`/*  #ifdef  h5  */
*,
::before,
::after {
  box-sizing: border-box; /* 1 */
`)
    expect(readFile('taro/tailwind.css')).toContain(`/*  #endif  */
/*  #ifndef  h5  */
page,
cover-image,
`)
  })
})
