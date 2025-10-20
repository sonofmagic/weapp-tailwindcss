import path from 'node:path'
import process from 'node:process'
import consola from 'consola'
import pc from 'picocolors'
import { detectPackageManager, run } from './run'

function formatProjectName(root: string, projectPath?: string) {
  if (!projectPath)
    return '<unknown>'

  const relative = path.relative(root, projectPath)
  return relative || '.'
}

;

(async () => {
  const demoPath = path.resolve(import.meta.dirname, '../../demo')
  const rootManager = await detectPackageManager(demoPath)

  try {
    await run(demoPath, (pkgInfo, packageManager) => {
      const manager = packageManager ?? rootManager
      const hasBuildScript = Boolean(pkgInfo?.packageJson.scripts?.build)

      if (!hasBuildScript) {
        consola.info(`${pc.dim(formatProjectName(demoPath, pkgInfo?.rootPath))} skipped (no build script)`)
        return null
      }

      if (manager === 'pnpm')
        return 'pnpm run build'

      if (manager === 'npm')
        return 'npm run build'

      return 'pnpm run build'
    })
  }
  catch (error) {
    consola.error('demo:build failed', error)
    process.exitCode = 1
  }
})()
