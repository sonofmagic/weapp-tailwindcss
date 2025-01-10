import { Buffer } from 'node:buffer'
import { internalCssSelectorReplacer } from '@weapp-tailwindcss/postcss'

function getLightningCss() {
  return import('lightningcss')
}
// https://lightningcss.dev/transforms.html
// new TextEncoder().encode('.foo { color: red }'),
export async function transformCss(css: string | Buffer = '.foo { color: red }') {
  const x = await getLightningCss()

  const res = x.transform({
    filename: 'test.css',
    code: Buffer.from(css),
    minify: true,
    targets: {

    },
    visitor: {
      // StyleSheet(stylesheet) {
      //   return stylesheet
      // },
      // Rule(rule) {
      //   return rule
      // },
      Selector(selector) {
        return selector.map((x) => {
          return x.type === 'class'
            ? {
                ...x,
                name: internalCssSelectorReplacer(x.name),
              }
            : x
        })
      },
    },
    // pseudoClasses: {
    //   // ':hover': ':hover',
    //   // ':active': ':active',
    //   // ':focus': ':focus',
    //   // ':focus-visible': ':focus-visible',
    //   // ':focus-within': ':focus-within',
    //   // ':visited': ':visited',
    //   // ':target': ':target',
    //   // ':enabled': ':enabled',
    // }
    // cssModules
    // minify: true,
    // sourceMap: true
  })
  return res
}
