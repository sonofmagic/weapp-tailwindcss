import type { BuildOutputCase } from './types'

export const rawTailwindDirectiveRE = /@(import\s+["']tailwindcss|tailwind|apply|theme|source)\b/

export function createLocalTargetCase(options: {
  name: string
  framework: BuildOutputCase['framework']
  projectDir: string
  platform: string
  reason: string
}): BuildOutputCase {
  return {
    name: options.name,
    framework: options.framework,
    projectDir: options.projectDir,
    platform: options.platform,
    command: ['node', '-e', 'process.exit(0)'],
    outputDir: '.',
    requiredFiles: ['package.json'],
    styleFiles: ['package.json'],
    styleContains: [],
    status: 'local',
    reason: options.reason,
  }
}

export function uniqueTargetKey(item: {
  framework: string
  projectDir: string
  platform: string
}) {
  return `${item.framework}:${item.projectDir}:${item.platform}`
}
