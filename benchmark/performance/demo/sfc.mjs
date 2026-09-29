import { createRequire } from 'node:module'
import path from 'node:path'
import { repo } from '../../../scripts/ci/demo-matrix/catalog.mjs'

const require = createRequire(path.join(repo, 'demo/web/vue-vite7-tailwindcss-v4/package.json'))
const { parse } = require('vue/compiler-sfc')

export function sfcBlocks(source, filename) {
  const { descriptor } = parse(source, { filename })
  return [descriptor.template, descriptor.script, descriptor.scriptSetup, ...descriptor.styles].filter(Boolean).map(block => ({ type: block.type, attrs: block.attrs, offset: block.loc.start.offset, length: block.content.length, content: block.content })).sort((a, b) => a.offset - b.offset)
}
