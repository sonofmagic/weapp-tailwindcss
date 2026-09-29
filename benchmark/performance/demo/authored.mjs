import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { decode } from './capture.cjs'
import { inside } from './published.mjs'
import { isWeb } from '../../../scripts/ci/demo-matrix/catalog.mjs'

export async function compileAuthored(consumer, records, capturedRoot) {
  const require = createRequire(path.join(consumer.project, 'package.json'))
  const injector = require('weapp-style-injector')
  const config = records.filter(row => row.key === 'options')
  assert.equal(config.length, 1, '样式注入静态基线需要唯一配置')
  const options = decode(config[0].value.options, capturedRoot, consumer.project)
  const root = path.join(consumer.project, 'src')
  const scopes = consumer.item.family === 'uni'
    ? injector.resolveUniAppStyleScopes({ ...options, pagesJsonPath: path.join(root, 'pages.json') })
    : consumer.item.family === 'taro'
      ? injector.resolveTaroSubPackages({ ...options, appConfigPath: path.join(root, 'app.config.ts') })
      : injector.resolveMpxSubPackages({ ...options, appPath: path.join(root, 'app.mpx') })
  assert.ok(scopes.length, '发布版注入器没有解析到样式作用域')
  const additions = new Map()
  for (const scope of scopes) {
    assert.ok(inside(consumer.project, scope.sourceAbsolutePath), '注入来源越界')
    assert.ok(!scope.referenceFileName, '引用型注入需要单独验证其样式生成语义')
    let css = await readFile(scope.sourceAbsolutePath, 'utf8')
    const extension = path.extname(scope.sourceAbsolutePath)
    if (['.scss', '.sass'].includes(extension)) css = (await require('sass').compileStringAsync(css, { url: pathToFileURL(scope.sourceAbsolutePath), syntax: extension === '.sass' ? 'indented' : 'scss' })).css
    else if (extension === '.less') css = (await require('less').render(css, { filename: scope.sourceAbsolutePath })).css
    const targets = [...(scope.targetSourceFiles ?? []), ...(scope.sourceModules ?? [])]
    assert.ok(targets.length, '注入作用域没有源码目标映射，拒绝猜测输出关系')
    for (const target of targets) {
      const name = target.styleFileName ?? target.fileName.slice(0, -path.posix.extname(target.fileName).length)
      const output = `${name}${isWeb(consumer.item) ? '.css' : '.wxss'}`
      if (!injector.isFileMatchedBySubpackageScope(output, scope) || !injector.isSourceFileMatchedBySubpackageScope(target.fileName, scope)) continue
      const file = target.sourceAbsolutePath
      assert.ok(inside(consumer.project, file), '注入目标越界')
      const list = additions.get(file) ?? new Set()
      list.add(css)
      additions.set(file, list)
    }
  }
  const result = new Map()
  for (const [file, styles] of additions) {
    const relative = path.relative(consumer.project, file)
    const source = await readFile(file, 'utf8')
    const css = [...styles].join('\n')
    if (/\.(?:vue|mpx)$/.test(file)) result.set(relative, `${source}\n<style>\n${css}\n</style>\n`)
    else if (/\.(?:css|scss|sass|less)$/.test(file)) result.set(relative, `${css}\n${source}`)
    else {
      assert.match(file, /\.(?:tsx|jsx|ts|js)$/)
      const styleFile = `${file}.cost.css`
      result.set(path.relative(consumer.project, styleFile), css)
      result.set(relative, `import './${path.basename(styleFile)}'\n${source}`)
    }
  }
  return result
}
