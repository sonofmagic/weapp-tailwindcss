import type { ClassMutationConfig, ConcreteWatchCaseName, StyleMutationConfig, WatchCase } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildCases, demoWatchShardCases } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases'

interface DemoPackageJson {
  scripts?: Record<string, string>
}

const repoRoot = path.resolve(__dirname, '..')
const defaultDemoWatchCaseNames = new Set<ConcreteWatchCaseName>(Object.values(demoWatchShardCases).flat())
const demoDevWatchCases = buildCases(repoRoot)
  .filter((item): item is WatchCase & { name: ConcreteWatchCaseName } => defaultDemoWatchCaseNames.has(item.name as ConcreteWatchCaseName))
  .sort((left, right) => left.name.localeCompare(right.name))

const expectedDemoDevWatchCaseNames: ConcreteWatchCaseName[] = [
  'gulp-tailwindcss-v4',
  'mpx-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-vite-vue3-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
  'taro-webpack-vue3-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v4',
  'weapp-vite-tailwindcss-v4',
]

function readRootPackageJson() {
  return JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
    scripts?: Record<string, string>
  }
}

function readDemoPackageJson(project: string): DemoPackageJson {
  return JSON.parse(readFileSync(path.join(repoRoot, project, 'package.json'), 'utf8')) as DemoPackageJson
}

function toRepoRelative(file: string) {
  return path.relative(repoRoot, file).split(path.sep).join('/')
}

function expectUserSourceFile(file: string, label: string) {
  const relative = toRepoRelative(file)
  expect(relative, `${label} should edit a real demo source file`).toMatch(/^demo\//)
  expect(relative, `${label} should not edit generated dist output`).not.toContain('/dist/')
  expect(relative, `${label} should not edit generated unpackage output`).not.toContain('/unpackage/')
  expect(existsSync(file), `${label} source should exist: ${relative}`).toBe(true)
}

function collectClassMutationFiles(config: ClassMutationConfig | undefined) {
  return config ? [config.sourceFile] : []
}

function collectStyleMutationFiles(config: StyleMutationConfig | undefined) {
  return [
    ...(config ? [config.sourceFile] : []),
    ...(config?.importerFiles ?? []),
  ]
}

function collectUserEditedSourceFiles(watchCase: WatchCase) {
  return [
    ...collectClassMutationFiles(watchCase.contentMutation),
    ...collectClassMutationFiles(watchCase.templateMutation),
    ...collectClassMutationFiles(watchCase.scriptMutation),
    ...collectStyleMutationFiles(watchCase.styleMutation),
    ...(watchCase.subPackageMutations?.flatMap(item => [
      ...collectClassMutationFiles(item.templateMutation),
      ...collectClassMutationFiles(item.mainStyleMutation),
      ...collectStyleMutationFiles(item.styleMutation),
    ]) ?? []),
    ...(watchCase.userReportedHotUpdate ? [watchCase.userReportedHotUpdate.sourceFile] : []),
    ...(watchCase.webHmr
      ? [
          watchCase.webHmr.sourceFile,
          ...(watchCase.webHmr.cssEntryFile ? [watchCase.webHmr.cssEntryFile] : []),
        ]
      : []),
  ]
}

function frameworkFamily(watchCase: WatchCase) {
  if (watchCase.name === 'gulp-tailwindcss-v4') {
    return 'gulp'
  }
  if (watchCase.name === 'mpx-tailwindcss-v4') {
    return 'mpx'
  }
  if (watchCase.name === 'uni-app-vite-tailwindcss-v4') {
    return 'uni-app'
  }
  if (watchCase.name === 'weapp-vite-tailwindcss-v4') {
    return 'weapp-vite'
  }
  if (watchCase.name.includes('vue3')) {
    return 'taro-vue3'
  }
  return 'taro-react'
}

describe('demo user development workflow', () => {
  it('exposes a CI-runnable command that runs real demo dev/watch HMR', () => {
    const scripts = readRootPackageJson().scripts ?? {}

    expect(scripts['e2e:demo-user-workflow']).toContain('e2e/demo-user-workflow-output.test.ts')
    expect(scripts['e2e:demo-user-workflow']).toContain('e2e/demo-user-dev-workflow.test.ts')
    expect(scripts['e2e:demo-user-workflow:dev']).toBe('cross-env E2E_WATCH_CASE=demo pnpm e2e:watch')
  })

  it('covers every CI-stable demo framework family with real dev scripts', () => {
    expect(demoDevWatchCases.map(item => item.name)).toEqual(expectedDemoDevWatchCaseNames)
    expect(new Set(demoDevWatchCases.map(frameworkFamily))).toEqual(new Set([
      'gulp',
      'mpx',
      'taro-react',
      'taro-vue3',
      'uni-app',
      'weapp-vite',
    ]))

    for (const watchCase of demoDevWatchCases) {
      const packageJson = readDemoPackageJson(watchCase.project)
      const command = packageJson.scripts?.[watchCase.devScript]
      expect(command, `${watchCase.name} should expose ${watchCase.devScript}`).toBeTruthy()
      expect(toRepoRelative(watchCase.cwd), `${watchCase.name} cwd should be the demo project root`).toBe(watchCase.project)
    }
  })

  it('edits the same template, script, style, and subpackage files users edit while developing', () => {
    const editedExtensions = new Set<string>()

    for (const watchCase of demoDevWatchCases) {
      expect(watchCase.templateMutation, `${watchCase.name} should edit template classes`).toBeDefined()
      expect(watchCase.scriptMutation, `${watchCase.name} should edit script class strings`).toBeDefined()
      expect(watchCase.styleMutation, `${watchCase.name} should edit user-authored styles`).toBeDefined()
      expect(watchCase.subPackageMutations?.map(item => item.root).sort(), `${watchCase.name} should cover both subpackage roots`).toEqual(['sub-independent', 'sub-normal'])

      for (const sourceFile of collectUserEditedSourceFiles(watchCase)) {
        expectUserSourceFile(sourceFile, `${watchCase.name} dev workflow`)
        editedExtensions.add(path.extname(sourceFile))
      }
    }

    expect([...editedExtensions].sort()).toEqual(expect.arrayContaining([
      '.css',
      '.mpx',
      '.scss',
      '.ts',
      '.tsx',
      '.vue',
      '.wxml',
    ]))
  })

  it('keeps browser-backed H5 development cases on real DOM and computed-style assertions', () => {
    const webCases = demoDevWatchCases.filter(item => item.webHmr)

    expect(webCases.map(item => item.name).sort()).toEqual([
      'taro-vite-react-tailwindcss-v4',
      'taro-vite-vue3-tailwindcss-v4',
      'taro-webpack-react-tailwindcss-v4',
      'taro-webpack-vue3-tailwindcss-v4',
      'uni-app-vite-tailwindcss-v4',
    ])

    for (const watchCase of webCases) {
      const domSequence = watchCase.webHmr?.sourceDomReplacementSequence ?? []
      expect(domSequence.length, `${watchCase.name} should verify browser DOM after source edits`).toBeGreaterThan(0)
      for (const step of domSequence) {
        expect(step.expectedText, `${watchCase.name} should assert rendered text`).toBeTruthy()
        expect(Object.keys(step.expectedStyle ?? {}).length, `${watchCase.name} should assert computed style`).toBeGreaterThan(0)
      }
    }
  })
})
