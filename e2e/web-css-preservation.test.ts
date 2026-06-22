import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import fg from 'fast-glob'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { clearProjectBuildState } from './projectTest'

const repoRoot = path.resolve(__dirname, '..')
const rawTailwindDirectiveRE = /@(import\s+["']tailwindcss|tailwind|apply|theme|source)\b/

interface WebCssPreservationCase {
  name: string
  projectDir: string
  buildScript: string
  outputDir: string
  generatedCss: Array<string | RegExp>
  ordinaryCss: Array<string | RegExp>
}

const cases: WebCssPreservationCase[] = [
  {
    name: 'demo/web react vite Tailwind v4',
    projectDir: 'demo/web/react-vite-tailwindcss-v4',
    buildScript: 'build:web',
    outputDir: 'dist',
    generatedCss: ['.min-h-screen', '.font-semibold', '.text-\\[32rpx\\]'],
    ordinaryCss: [/font-family:\s*Inter/],
  },
  {
    name: 'demo/web react vite Tailwind v4',
    projectDir: 'demo/web/react-vite-tailwindcss-v4',
    buildScript: 'build:web',
    outputDir: 'dist',
    generatedCss: ['.min-h-screen', '.font-semibold', '.text-\\[32rpx\\]'],
    ordinaryCss: [/font-family:\s*Inter/],
  },
  {
    name: 'demo/web vue vite Tailwind v4',
    projectDir: 'demo/web/vue-vite-tailwindcss-v4',
    buildScript: 'build:web',
    outputDir: 'dist',
    generatedCss: ['.min-h-screen', '.font-semibold', '.text-\\[32rpx\\]'],
    ordinaryCss: [/font-family:\s*Inter/],
  },
  {
    name: 'demo/web vue vite Tailwind v4',
    projectDir: 'demo/web/vue-vite-tailwindcss-v4',
    buildScript: 'build:web',
    outputDir: 'dist',
    generatedCss: ['.min-h-screen', '.font-semibold', '.text-\\[32rpx\\]'],
    ordinaryCss: [/font-family:\s*Inter/],
  },
  {
    name: 'uni-app vite Tailwind v4 H5',
    projectDir: 'demo/uni-app-vite-tailwindcss-v4',
    buildScript: 'build:h5',
    outputDir: 'dist/build/h5',
    generatedCss: ['.flex', '.rounded-full'],
    ordinaryCss: ['.layer-card-v4', '.weapp-tw-user-ui-card', '.reset-button'],
  },
  {
    name: 'uni-app vite Tailwind v4 H5',
    projectDir: 'demo/uni-app-vite-tailwindcss-v4',
    buildScript: 'build:h5',
    outputDir: 'dist/build/h5',
    generatedCss: ['.flex', '.rounded-full'],
    ordinaryCss: ['.layer-card-v4', '.weapp-tw-user-ui-loading', '@keyframes weappTwUserUiRotation'],
  },
]

async function readCssOutputs(outputRoot: string) {
  const files = await fg('**/*.css', {
    absolute: true,
    cwd: outputRoot,
    onlyFiles: true,
  })
  const chunks: string[] = []
  for (const file of files.sort()) {
    chunks.push(await fs.readFile(file, 'utf8'))
  }
  return chunks.join('\n')
}

async function runBuild(item: WebCssPreservationCase) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  await clearProjectBuildState(projectRoot)
  await execa('pnpm', ['run', item.buildScript], {
    cwd: projectRoot,
    env: {
      ...process.env,
      BROWSER: 'none',
      NODE_ENV: 'production',
    },
    stdio: process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe',
  })
  return {
    outputRoot: path.resolve(projectRoot, item.outputDir),
    projectRoot,
  }
}

function expectCssIncludes(css: string, item: string | RegExp, message: string) {
  if (typeof item === 'string') {
    expect(css, message).toContain(item)
  }
  else {
    expect(css, message).toMatch(item)
  }
}

describe('web and H5 demo CSS preservation', () => {
  it.each(cases)('keeps generated and ordinary CSS for $name', async (item) => {
    const { outputRoot } = await runBuild(item)
    await expect(fs.access(path.resolve(outputRoot, 'index.html'))).resolves.toBeUndefined()

    const css = await readCssOutputs(outputRoot)
    expect(css.length, `${item.name} should emit CSS output`).toBeGreaterThan(0)
    expect(css, `${item.name} should not leave raw Tailwind directives`).not.toMatch(rawTailwindDirectiveRE)

    for (const expected of item.generatedCss) {
      expectCssIncludes(css, expected, `${item.name} should include generated Tailwind CSS: ${expected}`)
    }
    for (const expected of item.ordinaryCss) {
      expectCssIncludes(css, expected, `${item.name} should preserve ordinary project CSS: ${expected}`)
    }
  }, 1_200_000)
})
