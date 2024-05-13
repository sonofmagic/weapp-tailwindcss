import fs from 'node:fs'
import path from 'node:path'
import type { PackageJson } from 'pkg-types'
import semver from 'semver'
import { findAstNode } from '@/tailwindcss/supportCustomUnit'
import { defaultOptions } from '@/defaults'
import { demoPath } from '#test/util'
import type { ILengthUnitsPatchOptions } from '@/types'

describe.skip('demo projects', () => {
  // 'remax-app',
  const demoDir = ['uni-app', 'uni-app-vue3-vite', 'taro-app', 'mpx-app', 'native-mina', 'rax-app', 'taro-vue3-app', 'taro-vue2-app']
  it('is demo projects node_modules tailwindcss is patched correctly', () => {
    const demos = []
    for (const dir of demoDir) {
      const options = defaultOptions.supportCustomLengthUnitsPatch as Required<ILengthUnitsPatchOptions>
      const twRoot = path.resolve(demoPath, dir, 'node_modules', options.dangerousOptions.packageName!)
      const pkgJson = require(path.resolve(twRoot, 'package.json')) as PackageJson
      if (semver.gte(pkgJson.version!, options.dangerousOptions.gteVersion!)) {
        const p = path.resolve(twRoot, options.dangerousOptions.lengthUnitsFilePath!)
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf8')
          const { changed } = findAstNode(content, options)
          changed && demos.push(dir)
          // expect(changed).toBe(false)
        }
      }
    }
    expect(demos.length).toBe(0)
  })
})
