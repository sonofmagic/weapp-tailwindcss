import { color, serializeRGB } from '@csstools/css-color-parser'
import { ComponentValueType, parseComponentValue } from '@csstools/css-parser-algorithms'
import { tokenize } from '@csstools/css-tokenizer'
import fs from 'fs-extra'
import path from 'pathe'
import colors4 from 'tailwindcss4/colors'
// import colors from 'tailwindcss/colors'
import traverse from 'traverse'

function oklch2rgb(value: string) {
  const componentValue = parseComponentValue(tokenize({ css: value }))
  if (componentValue) {
    const colorData = color(componentValue)
    if (colorData) {
      const rgbComponentValue = serializeRGB(colorData)
      return rgbComponentValue
    }
  }
}

async function main() {
  const x = traverse(colors4).map(function (value) {
    if (this.isLeaf) {
      if (/oklch/.test(value)) {
        const node = oklch2rgb(value)
        if (node) {
          let res = '#'
          // eslint-disable-next-line prefer-arrow-callback
          node.walk(function (x) {
            if (x.node.type === ComponentValueType.Token && x.node.value[0] === 'number-token') {
              res += Number(x.node.value[1]).toString(16)
            }
          })
          return res
        }
      }
    }
    return value
  })
  await fs.writeJson(path.resolve(__dirname, './build/colors.json'), x, {
    encoding: 'utf8',
    spaces: 2,
  })
}

main()
