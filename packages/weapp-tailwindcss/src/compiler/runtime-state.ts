import type { CompilationEventBus } from './events'
import type { RefreshTailwindcssRuntimeOptions, TailwindcssRuntimeLike } from '@/types'
import { createCompilationEventBus } from './events'

export interface CompilerRuntimeState {
  tailwindRuntime: TailwindcssRuntimeLike
  readyPromise: Promise<void>
  refreshTailwindcssRuntime: (options?: RefreshTailwindcssRuntimeOptions) => Promise<TailwindcssRuntimeLike>
  events: CompilationEventBus
  /** 当前统一编译 revision；由事件总线推进。 */
  readonly revision: number
  dispose: () => void
}

export interface CreateCompilerRuntimeStateOptions {
  tailwindRuntime: TailwindcssRuntimeLike
  readyPromise?: Promise<void>
  refreshTailwindcssRuntime: (options?: RefreshTailwindcssRuntimeOptions) => Promise<TailwindcssRuntimeLike>
  events?: CompilationEventBus
}

/** 创建构建器无关的 runtime state，并保留旧字段供现有插件继续使用。 */
export function createCompilerRuntimeState(options: CreateCompilerRuntimeStateOptions): CompilerRuntimeState {
  const events = options.events ?? createCompilationEventBus()
  return {
    tailwindRuntime: options.tailwindRuntime,
    readyPromise: options.readyPromise ?? Promise.resolve(),
    refreshTailwindcssRuntime: options.refreshTailwindcssRuntime,
    events,
    get revision() {
      return events.revision
    },
    dispose() {
      events.clear()
    },
  }
}
