import { findWorkspacePackages } from '@pnpm/workspace.find-packages'
import path from 'pathe'

export async function getWorkspacePackages(cwd: string) {
  const packages = await findWorkspacePackages(cwd)
  return (
    await Promise.allSettled(packages.map(async (project) => {
      const pkgJsonPath = path.resolve(project.rootDir, 'package.json')
      return {
        ...project,
        pkgJsonPath,
      }
    }))
  )
    .filter((x) => {
      return x.status === 'fulfilled'
    })
    .map((x) => {
      return x.value
    })
}
