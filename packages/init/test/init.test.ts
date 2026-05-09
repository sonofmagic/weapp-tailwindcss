import fs from 'fs-extra'
import get from 'get-value'
import path from 'pathe'
import { afterEach, describe, expect, it } from 'vitest'
import { getInitDefaults, init } from '@/index'
import { defaultDevDeps } from '@/npm'
import { createTempFixture, fetchOptions } from './util'

describe('init', () => {
  const defaults = getInitDefaults()
  const tempRoots: string[] = []

  afterEach(async () => {
    await Promise.all(tempRoots.splice(0).map(root => fs.remove(root)))
  })

  it('common', async () => {
    const cwd = await createTempFixture('init-common', {})
    tempRoots.push(cwd)

    await init({
      cwd,
      pkgJsonBasename: 'package.json',
      fetchOptions,
    })
    const postcssConfigPath = path.resolve(cwd, defaults.postcssConfigBasename)
    expect(await fs.exists(postcssConfigPath)).toBe(true)
    expect(await fs.readFile(postcssConfigPath, 'utf8')).toMatchSnapshot('postcssConfig')
    const tailwindConfigPath = path.resolve(cwd, defaults.tailwindConfigBasename)
    expect(await fs.exists(tailwindConfigPath)).toBe(true)
    expect(await fs.readFile(tailwindConfigPath, 'utf8')).toMatchSnapshot('tailwindConfig')
    const pkgJsonPath = path.resolve(cwd, 'package.json')
    expect(await fs.exists(pkgJsonPath)).toBe(true)
    const json = await fs.readJSON(pkgJsonPath)
    expect(json.scripts?.postinstall).toBeUndefined()
    for (const [key, value] of Object.entries(defaultDevDeps)) {
      const version = get(json, `devDependencies.${key}`) as string
      expect(version.slice(1).startsWith(value)).toBe(true)
    }
  })

  it('esm', async () => {
    const cwd = await createTempFixture('init-esm', { type: 'module' })
    tempRoots.push(cwd)

    await init({
      cwd,
      pkgJsonBasename: 'package.json',
      fetchOptions,
    })
    const postcssConfigPath = path.resolve(cwd, defaults.postcssConfigBasename)
    expect(await fs.exists(postcssConfigPath)).toBe(true)
    expect(await fs.readFile(postcssConfigPath, 'utf8')).toMatchSnapshot('postcssConfig')
    const tailwindConfigPath = path.resolve(cwd, defaults.tailwindConfigBasename)
    expect(await fs.exists(tailwindConfigPath)).toBe(true)
    expect(await fs.readFile(tailwindConfigPath, 'utf8')).toMatchSnapshot('tailwindConfig')
    const pkgJsonPath = path.resolve(cwd, 'package.json')
    expect(await fs.exists(pkgJsonPath)).toBe(true)
    const json = await fs.readJSON(pkgJsonPath)
    expect(json.type).toBe('module')
    expect(json.scripts?.postinstall).toBeUndefined()
    for (const [key, value] of Object.entries(defaultDevDeps)) {
      const version = get(json, `devDependencies.${key}`) as string
      expect(version.slice(1).startsWith(value)).toBe(true)
    }
  })

  it('no-pkg-json', async () => {
    const tempRoot = path.resolve(process.cwd(), 'node_modules/.test-tmp')
    await fs.ensureDir(tempRoot)
    const cwd = await fs.mkdtemp(path.resolve(tempRoot, 'init-no-pkg-json-'))
    tempRoots.push(cwd)

    await init({
      cwd,
      pkgJsonBasename: 'package.json',
      fetchOptions,
    })
    expect(await fs.exists(path.resolve(cwd, defaults.postcssConfigBasename))).toBe(false)
    expect(await fs.exists(path.resolve(cwd, defaults.tailwindConfigBasename))).toBe(false)
    expect(await fs.exists(path.resolve(cwd, 'package.json'))).toBe(false)
  })
})
