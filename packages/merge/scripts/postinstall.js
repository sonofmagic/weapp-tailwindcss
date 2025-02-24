import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import satisfies from 'semver/functions/satisfies.js'

const require = createRequire(import.meta.url)

function getPackageVersion(pkgName) {
  try {
    const pkgPath = path.join(process.cwd(), 'node_modules', pkgName, 'package.json')
    if (fs.existsSync(pkgPath)) {
      const pkg = require(pkgPath)
      return pkg.version
    }

    // 尝试从 package.json 读取
    const rootPkgPath = path.join(process.cwd(), 'package.json')
    if (fs.existsSync(rootPkgPath)) {
      const rootPkg = require(rootPkgPath)
      return rootPkg.dependencies?.[pkgName] || rootPkg.devDependencies?.[pkgName] || null
    }
  }
  catch (error) {
    console.error(`Error reading ${pkgName} version:`, error)
  }
  return null
}

function main() {
  const distDir = path.resolve(import.meta.dirname, '../dist')

  if (!fs.existsSync(distDir)) {
    return
  }

  const tailwindVersion = getPackageVersion('tailwindcss')

  if (!tailwindVersion) {
    console.warn('tailwindcss not found in the project. Skipping swicth version of tailwind-merge.')
    return
  }

  let targetVersion = null

  if (satisfies(tailwindVersion, '^4.0.0')) {
    targetVersion = 4
  }
  else {
    targetVersion = 3
  }
  console.log(`tailwindcss version: ${tailwindVersion}`)
  console.log(`Switch version of tailwind-merge to v${targetVersion - 1}.`)
  for (const ext of ['cjs', 'd.cts', 'd.ts', 'js']) {
    const file = `v${targetVersion}.${ext}`
    fs.copyFileSync(
      path.resolve(distDir, file),
      path.resolve(distDir, `index.${ext}`),
    )
  }
  console.log('Switch version of tailwind-merge success.')
}

main()
