import fs from 'fs-extra'
import path from 'pathe'
import { parse } from 'postcss'
import { objectify } from 'postcss-js'

const x = objectify(parse(`::view-transition-old(root),
  ::view-transition-new(root) {
    mix-blend-mode: normal;
    animation: none;
  }
  
  ::view-transition-old(root) {
    z-index: 1;
  }
  
  ::view-transition-new(root) {
    z-index: 2147483646;
  }
  
  .dark::view-transition-old(root) {
    z-index: 2147483646;
  }
  
  .dark::view-transition-new(root) {
    z-index: 1;
  }`))

await fs.outputFile(
  path.resolve(import.meta.dirname, './base.css.ts'),
  `export default ${JSON.stringify(x, undefined, 2)}`,
  'utf8',
)
