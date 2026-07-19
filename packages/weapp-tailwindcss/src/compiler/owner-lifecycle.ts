import { disposeCompilationChangeCoordinator } from './compilation-change-coordinator'
import { disposeCompilationSessionPool } from './compilation-session-pool'
import { disposeCompilerShadowReportSession } from './shadow-report-session'
import { disposeTailwindGenerationSessionPool } from './tailwind-generation-session-pool'

const compilerOwnerDisposals = new WeakMap<object, Promise<void>>()

async function disposeCompilerOwnerResources(owner: object) {
  disposeCompilationChangeCoordinator(owner)
  await disposeCompilationSessionPool(owner)
  disposeTailwindGenerationSessionPool(owner)
  disposeCompilerShadowReportSession(owner)
}

export function disposeCompilerOwner(owner: object) {
  const currentDisposal = compilerOwnerDisposals.get(owner)
  if (currentDisposal) {
    return currentDisposal
  }
  const disposal = disposeCompilerOwnerResources(owner).finally(() => {
    if (compilerOwnerDisposals.get(owner) === disposal) {
      compilerOwnerDisposals.delete(owner)
    }
  })
  compilerOwnerDisposals.set(owner, disposal)
  return disposal
}
