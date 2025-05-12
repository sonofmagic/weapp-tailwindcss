import fs from 'node:fs'
import path from 'node:path'
import { getPackageInfoSync } from 'local-pkg'
import satisfies from 'semver/functions/satisfies.js'

function main() {
  const distDir = path.resolve(__dirname, '../dist')

  if (!fs.existsSync(distDir)) {
    return
  }
  const packageInfo = getPackageInfoSync('tailwindcss')

  if (!packageInfo) {
    console.warn('tailwindcss not found in the project. Skipping swicth version of tailwind-merge.')
    return
  }

  const tailwindVersion = packageInfo.version!

  let targetVersion = 3

  if (satisfies(tailwindVersion, '^4.0.0')) {
    targetVersion = 4
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
