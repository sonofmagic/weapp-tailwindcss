import type { ResolvedSubpackageStyleScope } from '@/subpackage'

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { resolveMpxSubPackages } from '@/mpx'
import {
  collectPresetConfigs,
  createAsyncScopeGenerator,
  createSyncScopeGenerator,
} from '@/preset-resolution'
import { resolveTaroSubPackages } from '@/taro'
import { resolveUniAppStyleScopes } from '@/uni-app'

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'weapp-style-injector-shared-'))
}

function createScope(sourceAbsolutePath: string): ResolvedSubpackageStyleScope {
  return {
    root: 'pkg/nested',
    sourceRelativePath: 'pkg/nested/index.css',
    sourceAbsolutePath,
    outputName: 'index',
    preprocess: false,
    framework: 'test',
  }
}

describe('shared sub-package resolution', () => {
  it.each([
    {
      framework: 'uni-app',
      resolve(tempDir: string) {
        const pagesJsonPath = path.join(tempDir, 'pages.json')
        fs.writeFileSync(pagesJsonPath, JSON.stringify({
          subPackages: [{ root: '.\\pkg\\nested', pages: [{ path: '.\\pages\\home' }] }],
        }))
        return resolveUniAppStyleScopes({ pagesJsonPath, sourceFileName: 'index.css' }, undefined)
      },
    },
    {
      framework: 'taro',
      resolve(tempDir: string) {
        const appConfigPath = path.join(tempDir, 'app.config.json')
        fs.writeFileSync(appConfigPath, JSON.stringify({
          subPackages: [{ root: '.\\pkg\\nested', pages: [{ path: '.\\pages\\home' }] }],
        }))
        return resolveTaroSubPackages({ appConfigPath, sourceFileName: 'index.css' })
      },
    },
    {
      framework: 'mpx',
      resolve(tempDir: string) {
        const appPath = path.join(tempDir, 'app.json')
        fs.writeFileSync(appPath, JSON.stringify({
          subPackages: [{ root: '.\\pkg\\nested', pages: [{ path: '.\\pages\\home' }] }],
        }))
        return resolveMpxSubPackages({ appPath, sourceFileName: 'index.css' })
      },
    },
  ])('normalizes relative and backslash paths for $framework', ({ framework, resolve }) => {
    const tempDir = createTempDir()
    const scopeRoot = path.join(tempDir, 'pkg/nested')
    fs.mkdirSync(path.join(scopeRoot, 'pages'), { recursive: true })
    fs.writeFileSync(path.join(scopeRoot, 'index.css'), '.scope {}')
    fs.writeFileSync(path.join(scopeRoot, 'pages/home.css'), '.home {}')

    const [scope] = resolve(tempDir)
    expect(scope).toMatchObject({
      root: 'pkg/nested',
      sourceRelativePath: 'pkg/nested/index.css',
      framework,
      targetFiles: ['pkg/nested/pages/home'],
      targetSourceFiles: [{
        fileName: 'pkg/nested/pages/home.css',
        sourceAbsolutePath: path.join(scopeRoot, 'pages/home.css'),
      }],
    })
  })
})

describe('shared preset resolution', () => {
  it('keeps explicit configs ahead of discovered defaults and deduplicates paths', () => {
    const tempDir = createTempDir()
    const explicitPath = path.join(tempDir, 'explicit.json')
    const discoveredPath = path.join(tempDir, 'discovered.json')
    fs.writeFileSync(explicitPath, '{}')
    fs.writeFileSync(discoveredPath, '{}')

    const explicit = { filePath: explicitPath, marker: 'explicit' }
    const configs = collectPresetConfigs({
      explicitConfigs: explicit,
      requestedPaths: [explicitPath, discoveredPath],
      defaultPaths: [],
      getConfigPath: config => config.filePath,
      createDiscoveredConfig: filePath => ({ filePath, marker: 'discovered' }),
    })

    expect(configs).toEqual([
      explicit,
      { filePath: discoveredPath, marker: 'discovered' },
    ])
  })

  it('keeps sync and async scope generation behavior aligned', async () => {
    const tempDir = createTempDir()
    const sourcePath = path.join(tempDir, 'index.css')
    fs.writeFileSync(sourcePath, '.scope {}')
    const context = {
      root: 'pkg/nested',
      sourcePath,
      outputFileName: 'pkg/nested/index.wxss',
      styleExt: '.wxss',
      framework: 'test',
      bundler: 'test',
      sourceFiles: [],
      pageStyleFiles: [],
    }

    expect(createSyncScopeGenerator([createScope(sourcePath)])(context)).toBe('.scope {}')
    await expect(createAsyncScopeGenerator([createScope(sourcePath)])(context)).resolves.toBe('.scope {}')

    const generatedScope = createScope(sourcePath)
    generatedScope.generate = () => '.generated {}'
    expect(createSyncScopeGenerator([generatedScope])(context)).toBe('.generated {}')
    await expect(createAsyncScopeGenerator([generatedScope])(context)).resolves.toBe('.generated {}')

    fs.unlinkSync(sourcePath)
    expect(createSyncScopeGenerator([createScope(sourcePath)])(context)).toBeUndefined()
    await expect(createAsyncScopeGenerator([createScope(sourcePath)])(context)).resolves.toBeUndefined()
  })
})
