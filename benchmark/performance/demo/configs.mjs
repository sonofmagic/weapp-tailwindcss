import assert from 'node:assert/strict'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseAsync } from '@babel/core'
import fg from 'fast-glob'
import { inside } from './published.mjs'

const specifierRE = /^(?:weapp-tailwindcss\/(?:vite|webpack|rspack|gulp|framework|presets)|weapp-style-injector\/(?:vite|webpack)\/[^/]+)$/
function walk(node, visit) {
  if (!node || typeof node !== 'object') return
  visit(node)
  for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(item => walk(item, visit)); else if (value && typeof value === 'object') walk(value, visit)
}

export async function rewriteConfiguration(source, filename, replace, { weappVite = false, capture = false } = {}) {
  const ast = await parseAsync(source, { filename, configFile: false, babelrc: false, parserOpts: { plugins: ['typescript', 'jsx'], sourceType: 'unambiguous' } })
  const edits = []
  walk(ast.program, (node) => {
    const argument = node.type === 'ImportDeclaration' ? node.source
      : node.type === 'CallExpression' && node.callee.name === 'require' ? node.arguments[0] : undefined
    if (argument?.type === 'StringLiteral' && specifierRE.test(argument.value)) edits.push({ start: argument.start, end: argument.end, text: JSON.stringify(replace(argument.value)) })
    if (weappVite && node.type === 'ObjectProperty' && node.key.name === 'tailwindcss' && node.value.type === 'ObjectExpression') {
      edits.push({ start: node.value.start, end: node.value.end, text: capture ? `__costCapture(${source.slice(node.value.start, node.value.end)})` : 'false' })
    }
  })
  for (const edit of edits.sort((a, b) => b.start - a.start)) source = `${source.slice(0, edit.start)}${edit.text}${source.slice(edit.end)}`
  if (weappVite && capture) source = `import { captureOptions as __costCapture } from './.cost/capture.cjs'\n${source}`
  return source
}

export async function configure(consumer, mode, records = [], capturedRoot = consumer.project) {
  const support = path.join(consumer.project, '.cost')
  await mkdir(support, { recursive: true })
  await cp(fileURLToPath(new URL('./capture.cjs', import.meta.url)), path.join(support, 'capture.cjs'))
  const files = await fg(['**/*config*.{ts,js,mjs,cjs}', '**/config/**/*.{ts,js,mjs,cjs}', '**/gulpfile.ts', 'demo/web/shared/*.{ts,mjs}'], { cwd: consumer.root, absolute: true, ignore: ['**/node_modules/**', '**/dist/**', '**/.cost/**'] })
  const wrappers = new Map()
  const originalFiles = new Map()
  for (const file of files) {
    assert.ok(inside(consumer.root, file))
    const source = await readFile(file, 'utf8')
    originalFiles.set(file, source)
    const transformed = await rewriteConfiguration(source, file, (specifier) => {
      let wrapper = wrappers.get(specifier)
      if (!wrapper) { wrapper = path.join(support, `module-${wrappers.size}.cjs`); wrappers.set(specifier, wrapper) }
      // 配置 module specifier 是逻辑路径；必须先完成文件系统相对路径计算。
      const relative = path.relative(path.dirname(file), wrapper).split(path.sep).join('/')
      return relative.startsWith('.') ? relative : `./${relative}`
    }, { weappVite: consumer.item.family === 'weapp-vite' && path.basename(file) === 'vite.config.ts', capture: mode === 'capture' })
    await writeFile(file, transformed)
  }
  for (const [specifier, file] of wrappers) {
    let names
    if (specifier.endsWith('/framework')) names = ['resolveTaroPlatform', 'resolveUniPlatform', 'resolveMpxPlatform']
    else if (specifier.endsWith('/presets')) names = ['uniAppX', 'hbuilderx']
    else if (specifier.endsWith('/rspack')) names = ['patchRspackConfig']
    else if (specifier.endsWith('/gulp')) names = ['createPlugins']
    else names = [specifier.startsWith('weapp-style-injector') ? 'StyleInjector' : 'WeappTailwindcss']
    const prefix = mode === 'capture' ? `const original = require('node:module').createRequire(${JSON.stringify(path.join(consumer.project, 'package.json'))})(${JSON.stringify(specifier)}); const {capture} = require('./capture.cjs');\n`
      : `const {disabled} = require('./capture.cjs'); const records = ${JSON.stringify(records)}; const from = ${JSON.stringify(capturedRoot)}; const root = require('node:path').dirname(__dirname);\n`
    await writeFile(file, prefix + names.map(name => mode === 'capture' ? `exports.${name} = capture(${JSON.stringify(specifier)}, ${JSON.stringify(name)}, original.${name});`
      : `exports.${name} = ${name.startsWith('resolve') || ['hbuilderx', 'uniAppX'].includes(name) ? `(...args) => disabled(${JSON.stringify(name)}, records, from, root)(...args)` : `disabled(${JSON.stringify(name)}, records, from, root)`};`).join('\n'))
  }
  return async () => { for (const [file, source] of originalFiles) await writeFile(file, source) }
}
