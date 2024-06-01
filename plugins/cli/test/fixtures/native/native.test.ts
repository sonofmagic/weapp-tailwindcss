import path from 'node:path'
import fs from 'fs-extra'
// import tailwindcss from 'tailwindcss'
import { build } from '@/build'

describe('build', () => {
  it('native', async () => {
    const nativePath = __dirname
    process.chdir(nativePath)
    const { globsSet } = await build({
      root: '.',
    })

    function e(...args: string[]) {
      return fs.existsSync(path.resolve(__dirname, 'dist', ...args))
    }

    function r(...args: string[]) {
      return fs.readFileSync(path.resolve(__dirname, 'dist', ...args), 'utf8')
    }

    expect(globsSet).toMatchSnapshot()
    expect(e()).toBe(true)
    expect(e('app.wxss')).toBe(true)
    expect(e('pages/index/index.js')).toBe(true)
    expect(e('pages/index/index.json')).toBe(true)
    expect(e('pages/index/index.wxml')).toBe(true)
    expect(e('pages/index/index.wxss')).toBe(true)
    expect(e('sitemap.json')).toBe(true)

    expect(r('app.wxss')).toMatchSnapshot()
    expect(r('pages/index/index.js')).toMatchSnapshot()
    expect(r('pages/index/index.json')).toMatchSnapshot()
    expect(r('pages/index/index.wxml')).toMatchSnapshot()
    expect(r('pages/index/index.wxss')).toMatchSnapshot()
    expect(r('sitemap.json')).toMatchSnapshot()
  })
})


