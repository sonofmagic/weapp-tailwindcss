import type { ProjectEntry } from './shared'
import fs from 'node:fs/promises'
import path from 'pathe'
import { afterEach, describe, expect, it } from 'vitest'
import { replaceWxml } from '../packages/weapp-tailwindcss/src/wxml'
import { E2E_PROJECTS } from './projectEntries'
import { clearProjectBuildState, ensureProjectBuilt } from './projectTest'

const fixturesRoot = path.resolve(__dirname, '../demo')
const rawClasses = ['h-[458rpx]', 'w-[218rpx]', 'inset-x-[30%]'] as const
const markerClass = 'weapp-tw-dynamic-regression'

interface PatchTarget {
  file: string
  transform: (source: string) => string
}

interface ProjectPatch {
  entry: ProjectEntry
  targets: PatchTarget[]
}

const changedFiles = new Map<string, string>()

function projectRoot(entry: ProjectEntry) {
  return path.resolve(fixturesRoot, entry.name)
}

function projectOutputRoot(entry: ProjectEntry) {
  return path.resolve(fixturesRoot, entry.projectPath, path.dirname(entry.cssFile))
}

async function rememberOriginal(file: string) {
  if (changedFiles.has(file)) {
    return
  }
  changedFiles.set(file, await fs.readFile(file, 'utf8'))
}

async function patchFile(target: PatchTarget) {
  await rememberOriginal(target.file)
  const source = await fs.readFile(target.file, 'utf8')
  const next = target.transform(source)
  if (next === source) {
    throw new Error(`Unable to patch regression fixture: ${target.file}`)
  }
  await fs.writeFile(target.file, next, 'utf8')
}

async function restorePatchedFiles() {
  await Promise.all([...changedFiles].map(([file, source]) => fs.writeFile(file, source, 'utf8')))
  changedFiles.clear()
}

function createNativePatch(entry: ProjectEntry): ProjectPatch {
  const root = projectRoot(entry)
  const weappViteSourceRoot = entry.name === 'weapp-vite-tailwindcss-v3' ? 'miniprogram' : ''
  const pageFile = entry.name.startsWith('weapp-vite')
    ? path.resolve(root, weappViteSourceRoot, 'pages/index/index.wxml')
    : path.resolve(root, 'src/pages/index/index.wxml')
  const styleFile = entry.name.startsWith('weapp-vite')
    ? path.resolve(root, weappViteSourceRoot, 'pages/index/index.scss')
    : path.resolve(root, 'src/pages/index/index.scss')
  const pageMarker = entry.name === 'weapp-vite-tailwindcss-v3'
    ? '<view class="{{className}}">className</view>'
    : entry.name === 'weapp-vite-tailwindcss-v4'
      ? '<view class="space-y-2.5">'
      : '<view class="{{contentStyle}}">'
  const inserted = `${pageMarker}\n  <view class="${markerClass} {{true?'h-[458rpx] w-[218rpx] inset-x-[30%]':''}}">dynamic regression</view>`

  return {
    entry,
    targets: [
      {
        file: pageFile,
        transform: source => source.replace(pageMarker, inserted),
      },
      {
        file: styleFile,
        transform: source => `${createApplyStyle(entry)}${source}`,
      },
    ],
  }
}

function createMpxPatch(entry: ProjectEntry): ProjectPatch {
  const root = projectRoot(entry)
  const pageFile = path.resolve(root, 'src/pages/index.mpx')
  const pageMarker = entry.name.includes('-v4')
    ? '<view class="test">test</view>'
    : '<view wx:class="{{custom2}}"></view>'
  return {
    entry,
    targets: [
      {
        file: pageFile,
        transform: source => source.replace(pageMarker, `${pageMarker}\n    <view class="${markerClass}" wx:class="{{true ? 'h-[458rpx] w-[218rpx] inset-x-[30%]' : ''}}">dynamic regression</view>`),
      },
      {
        file: pageFile,
        transform: source => source.replace('</template>', `</template>\n\n<style>\n${createApplyStyle(entry)}</style>`),
      },
    ],
  }
}

function createTaroReactPatch(entry: ProjectEntry): ProjectPatch {
  const root = projectRoot(entry)
  const pageFile = path.resolve(root, 'src/pages/index/index.tsx')
  const styleExt = entry.name.includes('-v4') ? 'css' : 'scss'
  const styleFile = path.resolve(root, `src/pages/index/index.${styleExt}`)
  const dynamicElement = `<View className={true ? '${markerClass} h-[458rpx] w-[218rpx] inset-x-[30%]' : markerClass}>dynamic regression</View>`
  return {
    entry,
    targets: [
      {
        file: pageFile,
        transform: (source) => {
          if (source.includes('return (\n    <>')) {
            return source.replace('return (\n    <>', `return (\n    <>\n      ${dynamicElement}`)
          }
          return source.replace(/(<View(?:\s+className=['"][^'"]*['"])?\s*>)/, `$1\n      ${dynamicElement}`)
        },
      },
      {
        file: styleFile,
        transform: source => `${createApplyStyle(entry)}${source}`,
      },
    ],
  }
}

function createTaroVuePatch(entry: ProjectEntry): ProjectPatch {
  const root = projectRoot(entry)
  const pageFile = path.resolve(root, 'src/pages/index/index.vue')
  return {
    entry,
    targets: [
      {
        file: pageFile,
        transform: source => source.replace(
          /(<view(?:\s+class="[^"]*")?\s*>)/,
          `$1\n    <view class="${markerClass}" :class="true ? 'h-[458rpx] w-[218rpx] inset-x-[30%]' : ''">dynamic regression</view>`,
        ),
      },
      {
        file: pageFile,
        transform: source => `${source}\n<style>\n${createApplyStyle(entry)}</style>\n`,
      },
    ],
  }
}

function createUniAppPatch(entry: ProjectEntry): ProjectPatch {
  const root = projectRoot(entry)
  const pageFile = path.resolve(root, 'src/pages/index/index.vue')
  const rootMarker = entry.name.includes('-v4')
    ? '<view class="flex flex-col">'
    : '<view class="content"'
  const rootReplacement = entry.name.includes('-v4')
    ? `<view class="flex flex-col">\n    <view class="${markerClass}" :class="true ? 'h-[458rpx] w-[218rpx] inset-x-[30%]' : ''">dynamic regression</view>`
    : `<view class="${markerClass}" :class="true ? 'h-[458rpx] w-[218rpx] inset-x-[30%]' : ''">dynamic regression</view>\n  <view class="content"`
  return {
    entry,
    targets: [
      {
        file: pageFile,
        transform: source => source.replace(rootMarker, rootReplacement),
      },
      {
        file: pageFile,
        transform: source => source.replace('</script>', `</script>\n\n<style>\n${createApplyStyle(entry)}</style>`),
      },
    ],
  }
}

function createApplyStyle(entry: ProjectEntry) {
  const reference = entry.name.includes('-v4') ? '@reference "tailwindcss";\n' : ''
  return `${reference}.${markerClass} {\n  @apply min-w-0;\n}\n`
}

function createPatch(entry: ProjectEntry): ProjectPatch {
  if (entry.name.startsWith('gulp-') || entry.name.startsWith('weapp-vite-')) {
    return createNativePatch(entry)
  }
  if (entry.name.startsWith('mpx-')) {
    return createMpxPatch(entry)
  }
  if (entry.name.includes('-react-')) {
    return createTaroReactPatch(entry)
  }
  if (entry.name.startsWith('taro-') && entry.name.includes('-vue3-')) {
    return createTaroVuePatch(entry)
  }
  if (entry.name.startsWith('uni-app-')) {
    return createUniAppPatch(entry)
  }
  throw new Error(`Unsupported regression e2e project: ${entry.name}`)
}

async function applyPatch(projectPatch: ProjectPatch) {
  for (const target of projectPatch.targets) {
    await patchFile(target)
  }
}

async function readOutputFiles(entry: ProjectEntry) {
  const root = projectOutputRoot(entry)
  const files = await fs.readdir(root, { recursive: true, withFileTypes: true })
  const outputs: Array<{ name: string, content: string }> = []

  for (const file of files) {
    if (!file.isFile()) {
      continue
    }
    if (!/\.(?:wxml|axml|swan|ttml|qml|jxml|js|wxss|acss|ttss|qss|css)$/i.test(file.name)) {
      continue
    }
    outputs.push({
      name: file.name,
      content: await fs.readFile(path.resolve(file.parentPath, file.name), 'utf8'),
    })
  }

  return outputs
}

function expectBuiltRegression(entry: ProjectEntry, outputs: Array<{ name: string, content: string }>) {
  const joined = outputs.map(output => output.content).join('\n')
  const styles = outputs
    .filter(output => /\.(?:wxss|acss|ttss|qss|css)$/i.test(output.name))
    .map(output => output.content)
    .join('\n')

  expect(joined, `${entry.name} should include regression marker`).toContain(markerClass)
  expect(styles, `${entry.name} should emit min-width from min-w-0`).toContain('min-width')

  for (const raw of rawClasses) {
    expect(joined, `${entry.name} should escape ${raw}`).toContain(replaceWxml(raw))
    expect(joined, `${entry.name} should not keep raw ${raw}`).not.toContain(raw)
  }
}

describe('all demo dynamic class regression', () => {
  afterEach(async () => {
    await restorePatchedFiles()
  })

  for (const entry of E2E_PROJECTS) {
    it(entry.name, async () => {
      const patch = createPatch(entry)
      await applyPatch(patch)
      await clearProjectBuildState(projectRoot(entry))
      await ensureProjectBuilt(projectRoot(entry), { force: true })
      expectBuiltRegression(entry, await readOutputFiles(entry))
    })
  }
})
