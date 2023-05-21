import * as fs from 'node:fs'
import * as path from 'node:path'
import * as url from 'node:url'

function createReplacer(searchValue: RegExp | string, replaceValue: string) {
  return (filePath: string) => {
    const content = fs.readFileSync(filePath, {
      encoding: 'utf8'
    })
    const newContent = content.replace(searchValue, replaceValue)
    return fs.writeFileSync(filePath, newContent, {
      encoding: 'utf8'
    })
  }
}

const typeOutputPath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../types')

// const webpack4Replacer = createReplacer(/["']webpack4["']/g, "'webpack'")
const viteReplacer = createReplacer(/["']..\/..\/..\/node_modules\/vite["']/g, "'vite'")
const postcssReplacer = createReplacer(/["']..\/..\/node_modules\/postcss["']/g, "'postcss'")

// ;['./base/BaseJsxPlugin/v4.d.ts', './base/BaseTemplatePlugin/v4.d.ts']
//   .map((x) => {
//     return path.resolve(typeOutputPath, x)
//   })
//   .forEach((p) => {
//     webpack4Replacer(p)
//   })

const vitePath = path.resolve(typeOutputPath, './vite/index.d.ts')

viteReplacer(vitePath)
;for (const p of ['./postcss/mp.d.ts', './postcss/plugin.d.ts']
  .map((x) => {
    return path.resolve(typeOutputPath, x)
  })) {
    postcssReplacer(p)
  }
