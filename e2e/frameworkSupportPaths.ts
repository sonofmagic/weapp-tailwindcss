import type { FrameworkSupportCase } from './frameworkSupportMatrix'
import { fileURLToPath } from 'node:url'
import path from 'pathe'

const e2eDir = path.dirname(fileURLToPath(import.meta.url))

export function resolveFrameworkSupportPaths(entry: FrameworkSupportCase) {
  const fixturesRoot = path.resolve(e2eDir, entry.fixturesDir)
  const root = path.resolve(fixturesRoot, entry.project.name)
  const projectPath = path.resolve(fixturesRoot, resolveFrameworkIdeProjectPath(entry))
  const miniprogramRoot = entry.project.cssFile === 'app.wxss' ? projectPath : path.dirname(path.resolve(projectPath, entry.project.cssFile))
  const cssPath = path.resolve(projectPath, entry.project.cssFile)
  const appJsonPath = path.resolve(miniprogramRoot, 'app.json')

  return {
    appJsonPath,
    cssPath,
    fixturesRoot,
    miniprogramRoot,
    projectPath,
    root,
  }
}

function resolveFrameworkIdeProjectPath(entry: FrameworkSupportCase) {
  if (entry.name === 'uni-app-vite-tailwindcss-v4' || entry.name === 'uni-app-vite-tailwindcss-v4') {
    return `${entry.name}/dist/dev/mp-weixin`
  }
  return entry.project.projectPath
}
