import process from 'node:process'
import path from 'pathe'
import { GitClient } from './git'
import { getWorkspacePackages } from './utils'

export async function createContext(cwd = process.cwd()) {
  const git = new GitClient()
  const workspaceFilepath = path.resolve(import.meta.dirname, '../../pnpm-workspace.yaml')
  const projects = await getWorkspacePackages(cwd)
  return {
    cwd,
    git,
    workspaceFilepath,
    projects,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
