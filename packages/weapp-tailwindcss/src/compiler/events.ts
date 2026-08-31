export type CompilationEvent
  = | {
    type: 'source-updated'
    id: string
    source: string
    sourceKind?: 'css' | 'template' | 'script' | 'config' | 'asset'
  }
  | { type: 'source-removed', id: string }
  | { type: 'css-entry', id: string, source: string }
  | { type: 'bundle-emitted', file: string, artifact?: unknown }
  | { type: 'hot-update', id: string, mutation: 'template' | 'script' | 'style' | 'content' | 'subpackage' | 'root-style' }
  | { type: 'config-changed', id?: string }

export type CompilationEventListener = (event: CompilationEvent) => void | Promise<void>

export interface CompilationEventBus {
  readonly revision: number
  emit: (event: CompilationEvent) => Promise<number>
  subscribe: (listener: CompilationEventListener) => () => void
  clear: () => void
}

/** 创建跨 bundler 共用的生命周期事件总线。 */
export function createCompilationEventBus(): CompilationEventBus {
  const listeners = new Set<CompilationEventListener>()
  let revision = 0

  return {
    get revision() {
      return revision
    },
    async emit(event) {
      revision += 1
      for (const listener of [...listeners]) {
        await listener(event)
      }
      return revision
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    clear() {
      listeners.clear()
    },
  }
}
