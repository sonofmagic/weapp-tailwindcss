import { findAstNode } from '@/tailwindcss/supportCustomUnit'
import { defaultOptions } from '@/defaults'
import fs from 'fs'
import path from 'path'
import { demoPath } from '#test/util'
import { ILengthUnitsPatchOptions } from '@/types'
import type { PackageJson } from 'pkg-types'
import semver from 'semver'
describe.skip('demo projects', () => {
  const demoDir = ['uni-app', 'uni-app-vue3-vite', 'taro-app', 'mpx-app', 'native-mina', 'rax-app', 'remax-app', 'taro-vue3-app', 'taro-vue2-app']
  it('is demo projects node_modules tailwindcss is patched correctly', () => {
    const demos = []
    for (let i = 0; i < demoDir.length; i++) {
      const dir = demoDir[i]
      const options = defaultOptions.supportCustomLengthUnitsPatch as Required<ILengthUnitsPatchOptions>
      const twRoot = path.resolve(demoPath, dir, 'node_modules', options.dangerousOptions.packageName!)
      const pkgJson = require(path.resolve(twRoot, 'package.json')) as PackageJson
      if (semver.gte(pkgJson.version!, options.dangerousOptions.gteVersion!)) {
        const p = path.resolve(twRoot, options.dangerousOptions.lengthUnitsFilePath!)
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf-8')
          const { changed } = findAstNode(content, options)
          changed && demos.push(dir)
          // expect(changed).toBe(false)
        }
      }
    }
    expect(demos.length).toBe(0)
  })
})
