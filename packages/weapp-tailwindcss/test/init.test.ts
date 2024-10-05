import { getInitDefaults, init } from '@/init'
import { defaultDevDeps } from '@/npm'
import fs from 'fs-extra'
import get from 'get-value'
import path from 'pathe'
import { fetchOptions, fixturesRootPath } from './util'

describe('init', () => {
  const defaults = getInitDefaults()
  it('common', async () => {
    const cwd = path.resolve(fixturesRootPath, 'init/common')

    await init({
      cwd,
      pkgJsonBasename: 'package.test.json',
      fetchOptions,
    })
    const postcssConfigPath = path.resolve(cwd, defaults.postcssConfigBasename)
    expect(await fs.exists(postcssConfigPath)).toBe(true)
    expect(await fs.readFile(postcssConfigPath, 'utf8')).toMatchSnapshot('postcssConfig')
    const tailwindConfigPath = path.resolve(cwd, defaults.tailwindConfigBasename)
    expect(await fs.exists(tailwindConfigPath)).toBe(true)
    expect(await fs.readFile(tailwindConfigPath, 'utf8')).toMatchSnapshot('tailwindConfig')
    const pkgJsonPath = path.resolve(cwd, 'package.test.json')
    expect(await fs.exists(pkgJsonPath)).toBe(true)
    const json = await fs.readJSON(pkgJsonPath)
    expect(json).toMatchSnapshot('pkgJson')
    for (const [key, value] of Object.entries(defaultDevDeps)) {
      const version = get(json, `devDependencies.${key}`) as string
      expect(version.slice(1).startsWith(value)).toBe(true)
    }
  })

  it('esm', async () => {
    const cwd = path.resolve(fixturesRootPath, 'init/esm')
    await init({
      cwd,
      pkgJsonBasename: 'package.test.json',
      fetchOptions,
    })
    const postcssConfigPath = path.resolve(cwd, defaults.postcssConfigBasename)
    expect(await fs.exists(postcssConfigPath)).toBe(true)
    expect(await fs.readFile(postcssConfigPath, 'utf8')).toMatchSnapshot('postcssConfig')
    const tailwindConfigPath = path.resolve(cwd, defaults.tailwindConfigBasename)
    expect(await fs.exists(tailwindConfigPath)).toBe(true)
    expect(await fs.readFile(tailwindConfigPath, 'utf8')).toMatchSnapshot('tailwindConfig')
    const pkgJsonPath = path.resolve(cwd, 'package.test.json')
    expect(await fs.exists(pkgJsonPath)).toBe(true)
    const json = await fs.readJSON(pkgJsonPath)
    expect(json).toMatchSnapshot('pkgJson')
    for (const [key, value] of Object.entries(defaultDevDeps)) {
      const version = get(json, `devDependencies.${key}`) as string
      expect(version.slice(1).startsWith(value)).toBe(true)
    }
  })

  it('no-pkg-json', async () => {
    const cwd = path.resolve(fixturesRootPath, 'init/no-pkg-json')
    await init({
      cwd,
      pkgJsonBasename: 'package.test.json',
      fetchOptions,
    })
    expect(await fs.exists(path.resolve(cwd, defaults.postcssConfigBasename))).toBe(false)
    expect(await fs.exists(path.resolve(cwd, defaults.tailwindConfigBasename))).toBe(false)
    expect(await fs.exists(path.resolve(cwd, 'package.test.json'))).toBe(false)
  })
})
