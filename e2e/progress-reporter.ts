import type { Reporter, TestModule, TestRunEndReason, TestSpecification } from 'vitest/reporters'
import process from 'node:process'

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) {
    return `${seconds}s`
  }
  return `${minutes}m${String(seconds).padStart(2, '0')}s`
}

function formatProgress(completed: number, total: number) {
  const safeTotal = Math.max(total, 1)
  const width = 20
  const ratio = Math.min(Math.max(completed / safeTotal, 0), 1)
  const filled = Math.round(width * ratio)
  const percent = Math.round(ratio * 100)
  return `[${'#'.repeat(filled)}${'-'.repeat(width - filled)}] ${completed}/${total} ${percent}%`
}

function countModuleTests(module: TestModule) {
  return [...module.children.allTests()].length
}

function getModuleLabel(module: TestModule) {
  return module.relativeModuleId || module.moduleId
}

export default class E2EProgressReporter implements Reporter {
  private completedModules = 0
  private startedAt = 0
  private totalModules = 0
  private totalTests = 0

  onTestRunStart(specifications: readonly TestSpecification[]) {
    this.completedModules = 0
    this.startedAt = Date.now()
    this.totalModules = specifications.length
    this.totalTests = 0
    process.stdout.write(`[e2e-static] ${formatProgress(0, this.totalModules)} total=${this.totalModules}\n`)
  }

  onTestModuleCollected(testModule: TestModule) {
    this.totalTests += countModuleTests(testModule)
    process.stdout.write(
      `[e2e-static] collected ${getModuleLabel(testModule)} tests=${countModuleTests(testModule)} totalTests=${this.totalTests}\n`,
    )
  }

  onTestModuleStart(testModule: TestModule) {
    const elapsed = formatDuration(Date.now() - this.startedAt)
    process.stdout.write(
      `[e2e-static] ${formatProgress(this.completedModules, this.totalModules)} start ${getModuleLabel(testModule)} remaining=${this.totalModules - this.completedModules} elapsed=${elapsed}\n`,
    )
  }

  onTestModuleEnd(testModule: TestModule) {
    this.completedModules += 1
    const elapsed = formatDuration(Date.now() - this.startedAt)
    const state = testModule.state()
    process.stdout.write(
      `[e2e-static] ${formatProgress(this.completedModules, this.totalModules)} ${state} ${getModuleLabel(testModule)} remaining=${this.totalModules - this.completedModules} elapsed=${elapsed}\n`,
    )
  }

  onTestRunEnd(_testModules: readonly TestModule[], _unhandledErrors: readonly unknown[], reason: TestRunEndReason) {
    process.stdout.write(
      `[e2e-static] ${formatProgress(this.completedModules, this.totalModules)} done reason=${reason} elapsed=${formatDuration(Date.now() - this.startedAt)} tests=${this.totalTests}\n`,
    )
  }
}
