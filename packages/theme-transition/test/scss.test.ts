// import { pathToFileURL } from 'node:url'
import path from 'pathe'
import { compile, compileString } from 'sass'
// import sassTrue from 'sass-true'

// const importers = [
//   {
//     findFileUrl(url: string) {
//       if (url.startsWith('@')) {
//         const p = path.resolve(__dirname, '../scss', url.substring(2))
//         return new URL(
//           pathToFileURL(p),
//         )
//       }
//       // if (!url.startsWith('~')) {
//       //   return null
//       // }
//       // return new URL(
//       //   pathToFileURL(path.resolve('node_modules', url.substring(1))),
//       // )
//     },
//   },
// ]

describe('scss', () => {
  it('index', () => {
    const { css } = compile(path.resolve(__dirname, '../scss/index.scss'))
    expect(css).toMatchSnapshot()
  })

  it('compileString', () => {
    const { css } = compileString(``, {

    })
    expect(css).toMatchSnapshot()
  })

  // it('sassTrue', () => {
  //   const sassFile = path.join(__dirname, 'test.scss')
  //   sassTrue.runSass({ describe, it }, sassFile, { importers })
  // })
})
