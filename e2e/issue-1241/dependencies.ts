import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'

export const dependencyVersions = {
  '@dcloudio/uni-app': '3.0.0-5010520260709002',
  '@dcloudio/uni-mp-weixin': '3.0.0-5010520260709002',
  '@dcloudio/uni-components': '3.0.0-5010520260709002',
  '@dcloudio/vite-plugin-uni': '3.0.0-5010520260709002',
  'vue': '3.5.42',
  'vite': '5.2.8',
  'tailwindcss': '4.3.3',
}

/** 复现依赖固定在原始版本；允许复用已安装目录，但必须核对版本。 */
export async function prepareDependencies(temporary: string) {
  const root = process.env.E2E_ISSUE_1241_DEPENDENCIES ?? path.join(temporary, 'dependencies')
  if (!process.env.E2E_ISSUE_1241_DEPENDENCIES) {
    await mkdir(root, { recursive: true })
    await writeFile(path.join(root, 'package.json'), JSON.stringify({ name: 'issue-1241-framework', private: true, dependencies: dependencyVersions }, null, 2))
    await execa('pnpm', ['install', '--ignore-scripts'], { cwd: root, timeout: 120_000 })
  }
  const require = createRequire(path.join(root, 'package.json'))
  for (const [name, version] of Object.entries(dependencyVersions)) {
    const manifest = JSON.parse(await readFile(require.resolve(`${name}/package.json`), 'utf8'))
    assert.equal(manifest.version, version, `复现依赖版本不符：${name}`)
  }
  return root
}
