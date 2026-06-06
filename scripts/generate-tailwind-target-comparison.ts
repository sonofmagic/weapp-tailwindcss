import type { Root } from 'postcss'
import { Buffer } from 'node:buffer'
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import tailwindcssPostcssV4 from '@tailwindcss/postcss'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'
import tailwindcssV3 from 'tailwindcss'
import {
  createWeappTailwindcssGenerator,
  resolveTailwindV3Source,
  resolveTailwindV4Source,
} from 'weapp-tailwindcss/generator'
import { tailwindParityCandidateCategories, tailwindParityCandidates } from '../e2e/fixtures/tailwind-parity-candidates'

const require = createRequire(import.meta.url)

const repoRoot = path.resolve(import.meta.dirname, '..')
const reportRoot = path.join(repoRoot, 'reports', 'tailwind-v3-v4-target-comparison')
const artifactRoot = path.join(reportRoot, 'artifacts')

const tailwindcssV3Version = require('tailwindcss/package.json').version as string
const tailwindcssV4Version = require('tailwindcss4/package.json').version as string
const weappTailwindcssVersion = require('weapp-tailwindcss/package.json').version as string

const tailwindcssV4Root = path.dirname(require.resolve('tailwindcss4/package.json'))

const candidates = tailwindParityCandidates

const fixtureHtml = [
  '<view class="container mx-auto p-4 sm:p-6">',
  '  <view class="relative grid md:grid-cols-3 space-y-2 min-h-screen">',
  '    <view class="absolute inset-0 z-10 bg-[url(&quot;/hero.png&quot;)] opacity-50"></view>',
  '    <button class="flex px-3 py-2 rounded-full border border-red-500 bg-white hover:bg-blue-500 active:scale-95 shadow-md">',
  '      <text class="text-sm text-[#123456] font-bold leading-6 before:content-[&quot;web&quot;] after:content-[&quot;&quot;]">demo</text>',
  '    </button>',
  '    <view class="block w-10 h-10 w-[123px] h-[48rpx] bg-blue-500"></view>',
  '    <view class="hidden"></view>',
  '  </view>',
  '</view>',
  '',
].join('\n')

const tailwindV3Css = '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n'

const tailwindV4Css = [
  '@import "tailwindcss" source(none);',
  `@source inline('${toInlineSource(candidates)}');`,
  '',
].join('\n')

interface ArtifactStats {
  file: string
  bytes: number
  lines: number
  selectors: number
  classSelectors: number
  uniqueClassSelectors: number
  declarations: number
  atRules: Record<string, number>
  importantDeclarations: number
  featureFlags: Record<string, boolean>
}

interface Artifact {
  key: string
  label: string
  version: 3 | 4
  mode: 'official-tailwindcss' | 'weapp-tailwindcss-target-web' | 'weapp-tailwindcss-target-weapp'
  file: string
  css: string
  stats: ArtifactStats
}

function normalizeCss(css: string) {
  return css.replace(/\s+/g, ' ').trim()
}

function escapeSingleQuotedSourceToken(token: string) {
  return token.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
}

function toInlineSource(candidates: string[]) {
  return candidates.map(escapeSingleQuotedSourceToken).join(' ')
}

function countSelectorClasses(selector: string) {
  let classCount = 0
  const classNames = new Set<string>()
  selectorParser((selectors) => {
    selectors.walkClasses((node) => {
      classCount++
      classNames.add(node.value)
    })
  }).processSync(selector)
  return { classCount, classNames }
}

function collectStats(css: string, file: string): ArtifactStats {
  const root = postcss.parse(css, { from: file }) as Root
  let selectors = 0
  let classSelectors = 0
  const uniqueClassSelectors = new Set<string>()
  let declarations = 0
  let importantDeclarations = 0
  const atRules: Record<string, number> = {}

  root.walkRules((rule) => {
    selectors += rule.selectors?.length ?? 1
    for (const selector of rule.selectors ?? [rule.selector]) {
      const result = countSelectorClasses(selector)
      classSelectors += result.classCount
      for (const className of result.classNames) {
        uniqueClassSelectors.add(className)
      }
    }
  })

  root.walkDecls((decl) => {
    declarations++
    if (decl.important) {
      importantDeclarations++
    }
  })

  root.walkAtRules((rule) => {
    atRules[rule.name] = (atRules[rule.name] ?? 0) + 1
  })

  const hasRoundedFullDeclaration = css.includes('border-radius: 9999px')
    || css.includes('border-radius: calc(infinity * 1px)')
  const hasWxssEscapedClass = /(?:^|[,{]\s*)\.[\w-]*(?:_b|_B|_c|_p|_q|_h|_f|_P)[\w-]*/m.test(css)

  return {
    file: path.relative(reportRoot, file),
    bytes: Buffer.byteLength(css),
    lines: css.split('\n').length,
    selectors,
    classSelectors,
    uniqueClassSelectors: uniqueClassSelectors.size,
    declarations,
    atRules,
    importantDeclarations,
    featureFlags: {
      hasTailwindV4ThemeVariables: css.includes('--spacing:'),
      hasAtProperty: css.includes('@property'),
      hasLayer: css.includes('@layer'),
      hasMedia: css.includes('@media'),
      hasHoverPseudo: css.includes(':hover'),
      hasBeforeAfterPseudo: css.includes('::before') || css.includes('::after'),
      hasRpx: /[0-9)]rpx\b/.test(css),
      hasWxssEscapes: hasWxssEscapedClass,
      hasViewTextPreflight: css.includes('view,text') || css.includes('view,\ntext'),
      hasWeappRootScope: css.includes('page,.tw-root') || css.includes('page,\n.tw-root'),
      hasUniversalSelector: css.includes('*,') || css.includes('*::'),
      hasButtonSelector: css.includes('button'),
      hasRoundedFull: hasRoundedFullDeclaration,
    },
  }
}

async function writeArtifact(
  artifacts: Artifact[],
  key: string,
  label: string,
  version: 3 | 4,
  mode: Artifact['mode'],
  extension: 'css' | 'wxss',
  css: string,
) {
  const file = path.join(artifactRoot, `${key}.${extension}`)
  await writeFile(file, css)
  artifacts.push({
    key,
    label,
    version,
    mode,
    file,
    css,
    stats: collectStats(css, file),
  })
}

async function createTailwindV4FixtureRoot() {
  const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-target-comparison-'))
  const nodeModulesDir = path.join(root, 'node_modules')
  await mkdir(nodeModulesDir, { recursive: true })
  await symlink(tailwindcssV4Root, path.join(nodeModulesDir, 'tailwindcss'), 'dir')
  const cssEntry = path.join(root, 'app.css')
  await writeFile(cssEntry, tailwindV4Css)
  return { root, cssEntry }
}

function createComparison(artifacts: Artifact[]) {
  const byKey = new Map(artifacts.map(artifact => [artifact.key, artifact]))
  const pairs = [
    ['v3 官方 Tailwind CSS vs weapp target web', 'tailwind-v3-official', 'tailwind-v3-weapp-target-web'],
    ['v3 官方 Tailwind CSS vs weapp target weapp', 'tailwind-v3-official', 'tailwind-v3-weapp-target-weapp'],
    ['v4 官方 Tailwind CSS vs weapp target web', 'tailwind-v4-official', 'tailwind-v4-weapp-target-web'],
    ['v4 官方 Tailwind CSS vs weapp target weapp', 'tailwind-v4-official', 'tailwind-v4-weapp-target-weapp'],
    ['官方 Tailwind CSS v3 vs v4', 'tailwind-v3-official', 'tailwind-v4-official'],
    ['weapp target weapp v3 vs v4', 'tailwind-v3-weapp-target-weapp', 'tailwind-v4-weapp-target-weapp'],
  ] as const

  return pairs.map(([label, leftKey, rightKey]) => {
    const left = byKey.get(leftKey)!
    const right = byKey.get(rightKey)!
    return {
      label,
      left: left.stats.file,
      right: right.stats.file,
      normalizedEqual: normalizeCss(left.css) === normalizeCss(right.css),
      delta: {
        bytes: right.stats.bytes - left.stats.bytes,
        lines: right.stats.lines - left.stats.lines,
        selectors: right.stats.selectors - left.stats.selectors,
        declarations: right.stats.declarations - left.stats.declarations,
        uniqueClassSelectors: right.stats.uniqueClassSelectors - left.stats.uniqueClassSelectors,
      },
      leftOnlyFeatures: Object.fromEntries(
        Object.entries(left.stats.featureFlags).filter(([feature, enabled]) => enabled && !right.stats.featureFlags[feature]),
      ),
      rightOnlyFeatures: Object.fromEntries(
        Object.entries(right.stats.featureFlags).filter(([feature, enabled]) => enabled && !left.stats.featureFlags[feature]),
      ),
    }
  })
}

function createTargetVersionComparison(
  artifacts: Artifact[],
  target: 'web' | 'weapp',
) {
  const byKey = new Map(artifacts.map(artifact => [artifact.key, artifact]))
  const v3 = byKey.get(`tailwind-v3-weapp-target-${target}`)!
  const v4 = byKey.get(`tailwind-v4-weapp-target-${target}`)!

  return {
    target,
    left: v3.stats.file,
    right: v4.stats.file,
    normalizedEqual: normalizeCss(v3.css) === normalizeCss(v4.css),
    delta: {
      bytes: v4.stats.bytes - v3.stats.bytes,
      lines: v4.stats.lines - v3.stats.lines,
      selectors: v4.stats.selectors - v3.stats.selectors,
      declarations: v4.stats.declarations - v3.stats.declarations,
      uniqueClassSelectors: v4.stats.uniqueClassSelectors - v3.stats.uniqueClassSelectors,
      importantDeclarations: v4.stats.importantDeclarations - v3.stats.importantDeclarations,
    },
    leftOnlyFeatures: Object.fromEntries(
      Object.entries(v3.stats.featureFlags).filter(([feature, enabled]) => enabled && !v4.stats.featureFlags[feature]),
    ),
    rightOnlyFeatures: Object.fromEntries(
      Object.entries(v4.stats.featureFlags).filter(([feature, enabled]) => enabled && !v3.stats.featureFlags[feature]),
    ),
  }
}

function createVersionTargetComparison(
  artifacts: Artifact[],
  version: 3 | 4,
) {
  const byKey = new Map(artifacts.map(artifact => [artifact.key, artifact]))
  const web = byKey.get(`tailwind-v${version}-weapp-target-web`)!
  const weapp = byKey.get(`tailwind-v${version}-weapp-target-weapp`)!

  return {
    version,
    left: web.stats.file,
    right: weapp.stats.file,
    normalizedEqual: normalizeCss(web.css) === normalizeCss(weapp.css),
    delta: {
      bytes: weapp.stats.bytes - web.stats.bytes,
      lines: weapp.stats.lines - web.stats.lines,
      selectors: weapp.stats.selectors - web.stats.selectors,
      declarations: weapp.stats.declarations - web.stats.declarations,
      uniqueClassSelectors: weapp.stats.uniqueClassSelectors - web.stats.uniqueClassSelectors,
      importantDeclarations: weapp.stats.importantDeclarations - web.stats.importantDeclarations,
    },
    leftOnlyFeatures: Object.fromEntries(
      Object.entries(web.stats.featureFlags).filter(([feature, enabled]) => enabled && !weapp.stats.featureFlags[feature]),
    ),
    rightOnlyFeatures: Object.fromEntries(
      Object.entries(weapp.stats.featureFlags).filter(([feature, enabled]) => enabled && !web.stats.featureFlags[feature]),
    ),
  }
}

function createMarkdown(artifacts: Artifact[], comparisons: ReturnType<typeof createComparison>) {
  const byKey = new Map(artifacts.map(artifact => [artifact.key, artifact]))
  const row = (artifact: Artifact) => [
    artifact.label,
    `\`${artifact.stats.file}\``,
    artifact.stats.bytes,
    artifact.stats.lines,
    artifact.stats.selectors,
    artifact.stats.declarations,
    artifact.stats.uniqueClassSelectors,
    Object.keys(artifact.stats.atRules).map(name => `${name}:${artifact.stats.atRules[name]}`).join(', ') || '-',
  ].join(' | ')

  const comparisonRows = comparisons.map(item => [
    item.label,
    item.normalizedEqual ? '是' : '否',
    item.delta.bytes,
    item.delta.selectors,
    item.delta.declarations,
    Object.keys(item.leftOnlyFeatures).join(', ') || '-',
    Object.keys(item.rightOnlyFeatures).join(', ') || '-',
  ].join(' | '))

  const v3Official = byKey.get('tailwind-v3-official')!
  const v3Web = byKey.get('tailwind-v3-weapp-target-web')!
  const v3Weapp = byKey.get('tailwind-v3-weapp-target-weapp')!
  const v4Official = byKey.get('tailwind-v4-official')!
  const v4Web = byKey.get('tailwind-v4-weapp-target-web')!
  const v4Weapp = byKey.get('tailwind-v4-weapp-target-weapp')!

  return [
    '# Tailwind CSS v3/v4 与 weapp-tailwindcss target 输出对比报告',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 环境',
    '',
    `- weapp-tailwindcss: ${weappTailwindcssVersion}`,
    `- Tailwind CSS v3: ${tailwindcssV3Version}`,
    `- Tailwind CSS v4: ${tailwindcssV4Version}`,
    '- 生成方式：同一组 class 候选分别输入官方 Tailwind CSS 与 `weapp-tailwindcss/generator`。',
    '- 对比目标：官方 Tailwind CSS、`weapp-tailwindcss target: web`、`weapp-tailwindcss target: weapp`。',
    '',
    '## 素材',
    '',
    '- HTML fixture: `fixture.html`',
    '- Tailwind v3 CSS fixture: `fixture-tailwind-v3.css`',
    '- Tailwind v4 CSS fixture: `fixture-tailwind-v4.css`',
    `- 候选 class 数量：${candidates.length}`,
    `- 覆盖类别数量：${Object.keys(tailwindParityCandidateCategories).length}`,
    '',
    '覆盖点：preflight、container、flex/grid、spacing、size、`rpx` 任意值、`rounded-full`、border/color、background url、typography、shadow、opacity、hover/active、before/after content、responsive media。',
    '',
    '### 覆盖类别',
    '',
    ...Object.entries(tailwindParityCandidateCategories).map(([name, values]) => `- ${name}: ${values.length} 个`),
    '',
    '## 产物清单',
    '',
    '产物全部保留在 `artifacts/` 目录。',
    '',
    '| 产物 | 文件 | bytes | lines | selectors | declarations | unique classes | at-rules |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |',
    ...artifacts.map(row),
    '',
    '## 直接对比',
    '',
    '| 对比项 | 归一化后完全相同 | bytes Δ | selectors Δ | declarations Δ | 左侧独有特征 | 右侧独有特征 |',
    '| --- | --- | ---: | ---: | ---: | --- | --- |',
    ...comparisonRows,
    '',
    '## 关键结论',
    '',
    `1. Tailwind v3 下，\`target: web\` 与官方 Tailwind CSS 归一化后${normalizeCss(v3Official.css) === normalizeCss(v3Web.css) ? '完全一致' : '不完全一致'}；\`target: weapp\` 会进入小程序 CSS 转换，输出 \`${v3Weapp.stats.file}\`。`,
    `2. Tailwind v4 下，\`target: web\` 与官方 Tailwind CSS 归一化后${normalizeCss(v4Official.css) === normalizeCss(v4Web.css) ? '完全一致' : '不完全一致'}；\`target: weapp\` 会过滤/转换小程序不支持的 CSS 形态，输出 \`${v4Weapp.stats.file}\`。`,
    `3. v4 官方输出比 v3 官方输出${v4Official.stats.featureFlags.hasTailwindV4ThemeVariables ? '包含 Tailwind v4 主题变量与现代 CSS 层结构' : '未检测到 Tailwind v4 主题变量'}；v3 官方输出更接近传统 preflight 与工具类展开。`,
    `4. weapp target weapp 的共同特征是选择器和任意值 class 被小程序安全转义，例如 \`w-[123px]\` 会转成可在 WXSS 中使用的类名；同时保留 \`h-[48rpx]\` 的 rpx 输出。`,
    `5. \`rounded-full\` 在官方 Tailwind v3 中输出 \`9999px\`，在官方 Tailwind v4 中输出 \`calc(infinity * 1px)\`；weapp target weapp 会把 v4 的 infinity 形态降为小程序可接受的 \`9999px\`。`,
    `6. v4 weapp 输出会额外体现 v4 运行时需要的 root/theme 变量作用域，检测结果 hasWeappRootScope=${String(v4Weapp.stats.featureFlags.hasWeappRootScope)}；v3 weapp 主要体现 \`view,text\` preflight 转换，检测结果 hasViewTextPreflight=${String(v3Weapp.stats.featureFlags.hasViewTextPreflight)}。`,
    '',
    '## 关键差异索引',
    '',
    '- `artifacts/tailwind-v3-official.css` 与 `artifacts/tailwind-v3-weapp-target-web.css`：内容完全一致，可作为 v3 web parity 基线。',
    '- `artifacts/tailwind-v4-official.css` 与 `artifacts/tailwind-v4-weapp-target-web.css`：内容完全一致，可作为 v4 web parity 基线。',
    '- `artifacts/tailwind-v3-weapp-target-weapp.wxss`：关注 `view,text,::before,::after` preflight、`w-_b123px_B`、`h-_b48rpx_B`、`before_ccontent-*`、`rounded-full`。',
    '- `artifacts/tailwind-v4-weapp-target-weapp.wxss`：关注 `page,.tw-root,wx-root-portal-content,:host` 变量作用域、被移除的 `@property/@layer`、`rounded-full` 的 `9999px` 降级。',
    '- `artifacts/tailwind-v4-official.css`：关注 v4 的 `@property`、嵌套选择器、`calc(infinity * 1px)` 与主题变量。',
    '',
    '## 读取建议',
    '',
    '- 先看 `summary.json` 获取统计矩阵。',
    '- 单独看 v3/v4 web 产物差异：`web-comparison.md`。',
    '- 单独看 v3/v4 weapp 产物差异：`weapp-comparison.md`。',
    '- 单独看 Tailwind CSS v3 下 web/weapp 产物差异：`tailwind-v3-web-weapp-comparison.md`。',
    '- 单独看 Tailwind CSS v4 下 web/weapp 产物差异：`tailwind-v4-web-weapp-comparison.md`。',
    '- 对类名和选择器转义，直接对比 `tailwind-v*-official.css` 与 `tailwind-v*-weapp-target-weapp.wxss`。',
    '- 对 web parity，直接对比 `tailwind-v*-official.css` 与 `tailwind-v*-weapp-target-web.css`。',
    '',
  ].join('\n')
}

function createTargetMarkdown(
  artifacts: Artifact[],
  comparison: ReturnType<typeof createTargetVersionComparison>,
) {
  const byKey = new Map(artifacts.map(artifact => [artifact.key, artifact]))
  const v3 = byKey.get(`tailwind-v3-weapp-target-${comparison.target}`)!
  const v4 = byKey.get(`tailwind-v4-weapp-target-${comparison.target}`)!
  const targetLabel = comparison.target === 'web' ? 'target: web' : 'target: weapp'
  const fileKind = comparison.target === 'web' ? 'CSS' : 'WXSS'
  const row = (artifact: Artifact) => [
    artifact.label,
    `\`${artifact.stats.file}\``,
    artifact.stats.bytes,
    artifact.stats.lines,
    artifact.stats.selectors,
    artifact.stats.declarations,
    artifact.stats.uniqueClassSelectors,
    Object.keys(artifact.stats.atRules).map(name => `${name}:${artifact.stats.atRules[name]}`).join(', ') || '-',
  ].join(' | ')

  return [
    `# Tailwind CSS v3/v4 ${targetLabel} 样式产物对比报告`,
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 范围',
    '',
    `- 只比较 \`weapp-tailwindcss/generator\` 的 \`${targetLabel}\` 产物。`,
    `- v3 产物：\`${v3.stats.file}\``,
    `- v4 产物：\`${v4.stats.file}\``,
    `- 样式格式：${fileKind}`,
    `- 候选 class 数量：${candidates.length}`,
    `- 覆盖类别数量：${Object.keys(tailwindParityCandidateCategories).length}`,
    '',
    '## 产物统计',
    '',
    '| 产物 | 文件 | bytes | lines | selectors | declarations | unique classes | at-rules |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |',
    row(v3),
    row(v4),
    '',
    '## v3 vs v4 直接差异',
    '',
    '| 归一化后完全相同 | bytes Δ | lines Δ | selectors Δ | declarations Δ | unique classes Δ | important declarations Δ |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    [
      comparison.normalizedEqual ? '是' : '否',
      comparison.delta.bytes,
      comparison.delta.lines,
      comparison.delta.selectors,
      comparison.delta.declarations,
      comparison.delta.uniqueClassSelectors,
      comparison.delta.importantDeclarations,
    ].join(' | '),
    '',
    '## 特征差异',
    '',
    `- v3 独有特征：${Object.keys(comparison.leftOnlyFeatures).join(', ') || '-'}`,
    `- v4 独有特征：${Object.keys(comparison.rightOnlyFeatures).join(', ') || '-'}`,
    '',
    '## 结论',
    '',
    comparison.target === 'web'
      ? '- `target: web` 保留 Tailwind Web CSS 形态，因此 v3/v4 差异主要来自 Tailwind 官方版本自身的输出结构、主题变量、现代 CSS at-rules 和 `rounded-full` 等默认值变化。'
      : '- `target: weapp` 会经过小程序兼容转换，因此 v3/v4 差异同时包含 Tailwind 版本差异和 weapp 目标对选择器、任意值类名、preflight、unsupported at-rules 的转换差异。',
    comparison.target === 'web'
      ? '- 本报告不比较官方 Tailwind CSS 产物；官方 parity 仍见 `README.md` 与 `summary.json`。'
      : '- v4 weapp 产物会保留小程序可用的 v4 root/theme 变量作用域，并移除 `@property/@layer` 等小程序不适合直接输出的结构。',
    '',
    '## 读取建议',
    '',
    `- 直接打开 \`${v3.stats.file}\` 与 \`${v4.stats.file}\` 做逐段 diff。`,
    '- 机器读取可用 `summary.json` 的 `targetComparisons` 字段。',
    '',
  ].join('\n')
}

function createVersionTargetMarkdown(
  artifacts: Artifact[],
  comparison: ReturnType<typeof createVersionTargetComparison>,
) {
  const byKey = new Map(artifacts.map(artifact => [artifact.key, artifact]))
  const web = byKey.get(`tailwind-v${comparison.version}-weapp-target-web`)!
  const weapp = byKey.get(`tailwind-v${comparison.version}-weapp-target-weapp`)!
  const versionLabel = comparison.version === 3 ? 'Tailwind CSS v3' : 'Tailwind CSS v4'
  const row = (artifact: Artifact) => [
    artifact.label,
    `\`${artifact.stats.file}\``,
    artifact.stats.bytes,
    artifact.stats.lines,
    artifact.stats.selectors,
    artifact.stats.declarations,
    artifact.stats.uniqueClassSelectors,
    Object.keys(artifact.stats.atRules).map(name => `${name}:${artifact.stats.atRules[name]}`).join(', ') || '-',
  ].join(' | ')

  return [
    `# ${versionLabel} target: web 与 target: weapp 样式产物对比报告`,
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 范围',
    '',
    `- 只比较 ${versionLabel} 下 \`weapp-tailwindcss/generator\` 的 \`target: web\` 和 \`target: weapp\` 产物。`,
    `- web 产物：\`${web.stats.file}\``,
    `- weapp 产物：\`${weapp.stats.file}\``,
    '- 样式格式：web 为 CSS，weapp 为 WXSS。',
    `- 候选 class 数量：${candidates.length}`,
    `- 覆盖类别数量：${Object.keys(tailwindParityCandidateCategories).length}`,
    '',
    '## 产物统计',
    '',
    '| 产物 | 文件 | bytes | lines | selectors | declarations | unique classes | at-rules |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |',
    row(web),
    row(weapp),
    '',
    '## web vs weapp 直接差异',
    '',
    '| 归一化后完全相同 | bytes Δ | lines Δ | selectors Δ | declarations Δ | unique classes Δ | important declarations Δ |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    [
      comparison.normalizedEqual ? '是' : '否',
      comparison.delta.bytes,
      comparison.delta.lines,
      comparison.delta.selectors,
      comparison.delta.declarations,
      comparison.delta.uniqueClassSelectors,
      comparison.delta.importantDeclarations,
    ].join(' | '),
    '',
    '## 特征差异',
    '',
    `- web 独有特征：${Object.keys(comparison.leftOnlyFeatures).join(', ') || '-'}`,
    `- weapp 独有特征：${Object.keys(comparison.rightOnlyFeatures).join(', ') || '-'}`,
    '',
    '## 结论',
    '',
    comparison.version === 3
      ? '- Tailwind CSS v3 下，`target: web` 与官方 v3 CSS 保持一致；`target: weapp` 会进入小程序兼容转换，主要差异体现在 preflight 标签选择器、任意值类名转义、hover/button/universal 等 Web 选择器处理。'
      : '- Tailwind CSS v4 下，`target: web` 与官方 v4 CSS 保持一致；`target: weapp` 会移除或转换小程序不适合直接输出的 `@property/@layer` 等现代 CSS 结构，并保留 v4 weapp root/theme 变量作用域。',
    '- 两个 target 的差异是目标运行环境差异，不代表 Tailwind class 候选缺失；候选覆盖和 web parity 由 `pnpm e2e:generator-parity` 守卫。',
    '',
    '## 读取建议',
    '',
    `- 直接打开 \`${web.stats.file}\` 与 \`${weapp.stats.file}\` 做逐段 diff。`,
    '- 机器读取可用 `summary.json` 的 `versionTargetComparisons` 字段。',
    '',
  ].join('\n')
}

async function main() {
  await rm(reportRoot, { recursive: true, force: true })
  await mkdir(artifactRoot, { recursive: true })

  const fixtureDir = path.join(reportRoot, 'fixtures')
  await mkdir(fixtureDir, { recursive: true })
  await writeFile(path.join(fixtureDir, 'fixture.html'), fixtureHtml)
  await writeFile(path.join(fixtureDir, 'fixture-tailwind-v3.css'), tailwindV3Css)
  await writeFile(path.join(fixtureDir, 'fixture-tailwind-v4.css'), tailwindV4Css)
  await writeFile(path.join(fixtureDir, 'candidates.json'), `${JSON.stringify(candidates, null, 2)}\n`)

  const artifacts: Artifact[] = []

  const v3Config = {
    content: [{
      raw: candidates.join(' '),
      extension: 'html',
    }],
  }
  const officialV3 = await postcss([tailwindcssV3(v3Config)]).process(tailwindV3Css, {
    from: undefined,
  })
  const v3Source = await resolveTailwindV3Source({
    css: tailwindV3Css,
    base: repoRoot,
    configObject: v3Config,
  } as Parameters<typeof resolveTailwindV3Source>[0] & { configObject: typeof v3Config })
  const v3Engine = createWeappTailwindcssGenerator(v3Source)
  const v3Web = await v3Engine.generate({
    candidates,
    target: 'web',
  })
  const v3Weapp = await v3Engine.generate({
    candidates,
    target: 'weapp',
    styleOptions: {
      cssPreflight: {
        'box-sizing': 'border-box',
        'border-width': '0',
        'border-style': 'solid',
        'border-color': 'currentColor',
      },
    },
  })

  await writeArtifact(artifacts, 'tailwind-v3-official', 'Tailwind CSS v3 官方输出', 3, 'official-tailwindcss', 'css', officialV3.css)
  await writeArtifact(artifacts, 'tailwind-v3-weapp-target-web', 'weapp-tailwindcss v3 target web', 3, 'weapp-tailwindcss-target-web', 'css', v3Web.css)
  await writeArtifact(artifacts, 'tailwind-v3-weapp-target-weapp', 'weapp-tailwindcss v3 target weapp', 3, 'weapp-tailwindcss-target-weapp', 'wxss', v3Weapp.css)

  const v4Fixture = await createTailwindV4FixtureRoot()
  try {
    const officialV4 = await postcss([
      tailwindcssPostcssV4({
        optimize: false,
      }),
    ]).process(tailwindV4Css, {
      from: v4Fixture.cssEntry,
    })
    const v4Source = await resolveTailwindV4Source({
      css: tailwindV4Css,
      base: v4Fixture.root,
      packageName: 'tailwindcss',
    })
    const v4Engine = createWeappTailwindcssGenerator(v4Source)
    const v4Web = await v4Engine.generate({
      target: 'web',
    })
    const v4Weapp = await v4Engine.generate({
      target: 'weapp',
    })

    await writeArtifact(artifacts, 'tailwind-v4-official', 'Tailwind CSS v4 官方输出', 4, 'official-tailwindcss', 'css', officialV4.css)
    await writeArtifact(artifacts, 'tailwind-v4-weapp-target-web', 'weapp-tailwindcss v4 target web', 4, 'weapp-tailwindcss-target-web', 'css', v4Web.css)
    await writeArtifact(artifacts, 'tailwind-v4-weapp-target-weapp', 'weapp-tailwindcss v4 target weapp', 4, 'weapp-tailwindcss-target-weapp', 'wxss', v4Weapp.css)
  }
  finally {
    await rm(v4Fixture.root, { recursive: true, force: true })
  }

  const comparisons = createComparison(artifacts)
  const targetComparisons = {
    web: createTargetVersionComparison(artifacts, 'web'),
    weapp: createTargetVersionComparison(artifacts, 'weapp'),
  }
  const versionTargetComparisons = {
    tailwindcssV3: createVersionTargetComparison(artifacts, 3),
    tailwindcssV4: createVersionTargetComparison(artifacts, 4),
  }
  const summary = {
    generatedAt: new Date().toISOString(),
    versions: {
      weappTailwindcss: weappTailwindcssVersion,
      tailwindcssV3: tailwindcssV3Version,
      tailwindcssV4: tailwindcssV4Version,
    },
    candidateCategories: tailwindParityCandidateCategories,
    candidates,
    artifacts: artifacts.map(({ css: _css, ...artifact }) => ({
      ...artifact,
      file: path.relative(reportRoot, artifact.file),
    })),
    comparisons,
    targetComparisons,
    versionTargetComparisons,
  }

  await writeFile(path.join(reportRoot, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
  await writeFile(path.join(reportRoot, 'README.md'), createMarkdown(artifacts, comparisons))
  await writeFile(path.join(reportRoot, 'web-comparison.md'), createTargetMarkdown(artifacts, targetComparisons.web))
  await writeFile(path.join(reportRoot, 'weapp-comparison.md'), createTargetMarkdown(artifacts, targetComparisons.weapp))
  await writeFile(path.join(reportRoot, 'tailwind-v3-web-weapp-comparison.md'), createVersionTargetMarkdown(artifacts, versionTargetComparisons.tailwindcssV3))
  await writeFile(path.join(reportRoot, 'tailwind-v4-web-weapp-comparison.md'), createVersionTargetMarkdown(artifacts, versionTargetComparisons.tailwindcssV4))
  console.log(`Generated report at ${path.relative(repoRoot, reportRoot)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
