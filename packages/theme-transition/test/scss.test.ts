import { pathToFileURL } from 'node:url'
import path from 'pathe'
import { compile, compileString } from 'sass-embedded'
// import sassTrue from 'sass-true'
const importers = [
  {
    findFileUrl(url: string) {
      const p = path.resolve(__dirname, url)
      return new URL(
        pathToFileURL(p),
      )
    },
  },
]
describe('scss', () => {
  it('index', () => {
    const { css } = compile(path.resolve(__dirname, '../scss/index.scss'))
    expect(css).toMatchSnapshot()
  })

  it('compileString', () => {
    const { css } = compileString(`@use '../scss/mixins.scss' as M;
      @include M.theme-transition;`, {
      importers,
    })
    expect(css).toMatchSnapshot()
  })

  it('compileString case 0', () => {
    const { css } = compileString(`@use '../scss/mixins.scss' as M;
      @include M.theme-transition("[data-theme='dark']");`, {
      importers,
    })
    expect(css).toMatchSnapshot()
  })

  it('compileString case 1', () => {
    const { css } = compileString(`@use '../scss/mixins.scss' as M;
      @include M.theme-transition("[data-theme='dark']",2,3);`, {
      importers,
    })
    expect(css).toMatchSnapshot()
  })

  // it('sassTrue', () => {
  //   const sassFile = path.join(__dirname, 'test.scss')
  //   sassTrue.runSass({ describe, it }, sassFile, {
  //     silenceDeprecations: ['legacy-js-api'], // , 'color-4-api'],
  //     importers: {
  //       findFileUrl(url: string) {
  //         const p = path.resolve(__dirname, url)
  //         return new URL(
  //           pathToFileURL(p),
  //         )
  //       },
  //     },
  //   })
  // })
})
