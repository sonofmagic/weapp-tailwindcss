import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import fg from 'fast-glob'
import postcss from 'postcss'
import { decode } from './capture.cjs'
import { compileAuthored } from './authored.mjs'

export function stripGeneration(css) {
  const root = postcss.parse(css)
  root.walkAtRules(rule => {
    if (['tailwind', 'theme', 'source', 'config', 'plugin', 'utility', 'custom-variant', 'apply', 'reference'].includes(rule.name)
      || (rule.name === 'import' && /["'](?:tailwindcss|weapp-tailwindcss)(?:[\/"'])/.test(rule.params))) rule.remove()
  })
  return root.toString()
}

export async function sourceFiles(consumer) {
  return fg(['**/*.{vue,uvue,mpx,wxml,ttml,tsx,jsx,ts,js,wxs,css,scss,html}'], {
    cwd: consumer.project, ignore: ['node_modules/**', 'dist/**', '.output/**', '.nuxt/**', '.cost/**', '.weapp-vite/**', 'config/**', '**/*config.*', 'scripts/**', 'gulpfile.ts'],
  })
}

export async function compileStatic(consumer, records, capturedRoot) {
  if (consumer.item.name.startsWith('style-injector-')) return compileAuthored(consumer, records, capturedRoot)
  const require = createRequire(path.join(consumer.project, 'package.json'))
  const { createCompiler } = await import(pathToFileURL(require.resolve('weapp-tailwindcss/core')).href)
  const integrationRequire = createRequire(require.resolve('weapp-tailwindcss/package.json'))
  const { transformWebCssCompat } = integrationRequire('@weapp-tailwindcss/postcss/transform')
  const config = records.filter(row => row.key === 'options' && !row.value.options.disabled)
  assert.ok(config.length, '准备构建没有捕获启用的插件配置')
  const options = decode(config[0].value.options, capturedRoot, consumer.project)
  assert.ok(config.every(row => JSON.stringify(row.value.options) === JSON.stringify(config[0].value.options)), '同一目标有多个不同的插件配置，不能合并静态基线')
  assert.ok(options.cssEntries?.length, '静态基线需要构建配置声明 CSS 入口')
  const compiler = createCompiler(options)
  const target = options.generator?.target ?? (['h5', 'h5:ssr', 'web', 'app', 'harmony-hybrid'].includes(consumer.item.target) ? 'web' : 'weapp')
  const result = new Map()
  const compatibility = options.generator?.webCompat ?? (target === 'web' && !options.generator?.target ? true : false)
  const finalize = css => target === 'web' && compatibility ? transformWebCssCompat(css, compatibility) : css
  const generateStyle = async (css, file) => {
    const filename = path.join(consumer.project, file)
    return compiler.generate({ id: filename, target, sourceOptions: { projectRoot: consumer.project, cssSources: [{ css, file: filename, base: path.dirname(filename) }] }, scanSources: true, styleOptions: options, webCompat: options.generator?.webCompat })
  }
  try {
    const snapshots = []
    for (const entry of options.cssEntries) {
      const generated = await compiler.generate({
        id: entry, target,
        sourceOptions: { projectRoot: consumer.project, cssEntries: [entry] },
        scanSources: true,
        webCompat: options.generator?.webCompat ?? (target === 'web' && !options.generator?.target ? true : undefined),
        styleOptions: { ...options, ...options.generator?.styleOptions },
      })
      snapshots.push(generated.snapshot)
      result.set(path.relative(consumer.project, entry), finalize(generated.css))
    }
    const snapshot = compiler.mergeSnapshots(snapshots)
    for (const file of await sourceFiles(consumer)) {
      if (result.has(file)) continue
      const source = await readFile(path.join(consumer.project, file), 'utf8')
      let transformed = source
      if (/\.(?:vue|uvue|mpx)$/.test(file)) {
        // SFC 的模板、脚本分别转换，避免将整个 SFC 当作 JavaScript 解析。
        const replacements = []
        for (const match of source.matchAll(/<(template|script|style)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
          const offset = match.index + match[0].indexOf('>') + 1
          let content = match[2]
          if (target === 'weapp' && match[1] === 'template') content = await compiler.transformTemplate(content, snapshot)
          if (target === 'weapp' && match[1] === 'script') content = (await compiler.transformJavaScript(content, snapshot, { filename: file })).code
          if (match[1] === 'style' && /@(apply|reference|theme)/.test(content)) {
            assert.ok(!/lang=["'](?:scss|sass|less)/.test(match[0]), `内嵌预处理样式需先通过框架预处理器生成：${file}`)
            content = finalize((await generateStyle(content, file)).css)
          }
          else if (match[1] === 'style' && target === 'weapp') content = (await compiler.transformCss(content, snapshot)).css
          replacements.push({ offset, length: match[2].length, content })
        }
        for (const replacement of replacements.reverse()) transformed = transformed.slice(0, replacement.offset) + replacement.content + transformed.slice(replacement.offset + replacement.length)
      }
      else if (target === 'weapp' && /\.(?:wxml|ttml|html)$/.test(file)) transformed = await compiler.transformTemplate(source, snapshot)
      else if (target === 'weapp' && /\.(?:tsx|jsx|ts|js|wxs)$/.test(file)) transformed = (await compiler.transformJavaScript(source, snapshot, { filename: file })).code
      else if (/\.css$/.test(file) && /@(apply|reference|theme|import\s+["'](?:tailwindcss|weapp-tailwindcss))/.test(source)) {
        const generated = await generateStyle(source, file)
        transformed = finalize(generated.css)
      }
      else if (target === 'weapp' && /\.css$/.test(file)) transformed = (await compiler.transformCss(source, snapshot)).css
      if (transformed !== source) result.set(file, transformed)
    }
    return result
  }
  finally { await compiler.dispose() }
}

export async function applySources(consumer, sources) {
  for (const [file, source] of sources) {
    const target = path.join(consumer.project, file)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, source)
  }
}
