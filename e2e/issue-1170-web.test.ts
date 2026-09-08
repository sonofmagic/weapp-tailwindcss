import type { WebHmrStep } from './hbuilderx-local/cases'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import postcss from 'postcss'
import { describe, expect, it } from 'vitest'
import { webCases } from './hbuilderx-local/cases'
import { runPnpm } from './hbuilderx-local/process'
import { verifyWebHmr } from './hbuilderx-local/runner'

const projectRoot = path.resolve(__dirname, '../demo/issue-1144-uni-app-x-web')
const className = 'text-xl text-[#f7fbff] bg-[#102938] w-[200px]'
const source = `<template>
  <view>
    <view class="hbuilderx-web-hmr-probe issue-1170-marker">issue-1170-initial</view>
    <text id="issue-1170-text" class="${className}">Hello Tailwind on uni-app xxxx</text>
  </view>
</template>
<script setup lang="uts"></script>
<style lang="scss" scoped></style>
`

async function withReproduction(action: () => Promise<void>, eol = '\n') {
  const file = path.join(projectRoot, 'pages', 'index', 'index.uvue')
  const original = await readFile(file, 'utf8')
  try {
    await writeFile(file, source.replaceAll('\n', eol))
    await action()
  }
  finally {
    await writeFile(file, original)
  }
}

function runtimeStyles(width = '200px') {
  return [{
    selector: '#issue-1170-text',
    styles: { width, color: 'rgb(247, 251, 255)', backgroundColor: 'rgb(16, 41, 56)', fontSize: '20px' },
  }]
}

const run = process.env['E2E_ISSUE_1170_WEB'] === '1' ? describe : describe.skip

run('issue #1170 empty scoped SCSS Web lifecycle', () => {
  it.each(['LF', 'CRLF'])('preserves %s styles after text-only saves, class replacement and browser refresh', async (lineEnding) => {
    await withReproduction(async () => {
      const item = webCases.find(item => item.name === 'issue-1144-uni-app-x-web')!
      const hmrSteps: WebHmrStep[] = Array.from({ length: 6 }, (_, index) => ({
        markerClass: 'issue-1170-marker',
        markerText: `issue-1170-text-save-${index + 1}`,
        cssContains: [],
        runtimeStyles: runtimeStyles(),
        sourceMutation: {
          file: item.sourceFile,
          replace: {
            from: index === 0 ? 'Hello Tailwind on uni-app xxxx' : `Hello Tailwind on uni-app save-${index}`,
            to: `Hello Tailwind on uni-app save-${index + 1}`,
          },
        },
        reload: true,
      }))
      for (const [index, width] of [213, 227, 200].entries()) {
        hmrSteps.push({
          markerClass: 'issue-1170-marker',
          markerText: `issue-1170-class-save-${index + 1}`,
          cssContains: [],
          runtimeStyles: runtimeStyles(`${width}px`),
          sourceMutation: {
            file: item.sourceFile,
            replace: { from: `w-[${[200, 213, 227][index]}px]`, to: `w-[${width}px]` },
          },
          reload: true,
        })
      }
      await verifyWebHmr({
        ...item,
        markerAnchor: '<text id="issue-1170-text"',
        initialCssContains: ['weapp-tailwindcss uni-app-x web preflight reset'],
        initialTextContains: ['Hello Tailwind on uni-app xxxx'],
        initialRuntimeStyles: runtimeStyles(),
        persistentRuntimeStyles: [],
        hmrSteps,
      })
    }, lineEnding === 'CRLF' ? '\r\n' : '\n')
  }, 360_000)
})

it.skipIf(process.env['E2E_ISSUE_1170_STATIC'] !== '1')('issue #1170 production CSS retains the screenshot utilities', async () => {
  await withReproduction(async () => {
    await runPnpm(projectRoot, ['exec', 'cross-env', 'UNI_INPUT_DIR=.', 'uni', 'build'], 120_000)
    const files = await fg('**/*.css', { cwd: path.join(projectRoot, 'dist', 'build', 'h5'), absolute: true })
    const evidence = new Set<string>()
    for (const file of files) {
      postcss.parse(await readFile(file, 'utf8')).walkDecls((decl) => {
        if (['#f7fbff', '#102938', '200px'].includes(decl.value)) {
          evidence.add(`${decl.prop}: ${decl.value}`)
        }
      })
    }
    expect([...evidence].sort()).toEqual(['background-color: #102938', 'color: #f7fbff', 'width: 200px'])
    await expect(`${JSON.stringify([...evidence].sort(), null, 2)}\n`).toMatchFileSnapshot('__snapshots__/issue-1170-web/utilities.json')
  })
}, 150_000)
