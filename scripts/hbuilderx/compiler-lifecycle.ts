import type { SpawnedHBuilderXCommand } from '../../packages/hbuilderx-runner/src/types'
import process from 'node:process'

/** 只停止本轮编译进程树；进程退出与停止失败都必须完成收尾再返回。 */
export async function waitForCompiler(watcher: SpawnedHBuilderXCommand) {
  let rejectStop!: (error: unknown) => void
  const stopFailure = new Promise<never>((_resolve, reject) => {
    rejectStop = reject
  })
  let stopping: Promise<void> | undefined
  let cancelled = false
  const stop = (signal: NodeJS.Signals = 'SIGTERM') => {
    stopping ??= watcher.stop(signal)
    void stopping.catch(rejectStop)
  }
  const onSignal = (signal: NodeJS.Signals) => {
    cancelled = true
    stop(signal)
  }
  // exit 早于 close；此时受管进程组身份仍有效，必须立即领取清理句柄。
  const onExit = () => stop()
  watcher.child.once('exit', onExit)
  const handlers = {
    SIGINT: () => onSignal('SIGINT'),
    SIGTERM: () => onSignal('SIGTERM'),
  }
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, handlers[signal])
  }
  let failure: { error: unknown } | undefined
  try {
    const exit = await Promise.race([watcher.closed, stopFailure])
    if (!cancelled) {
      throw new Error(`HBuilderX 独立微信编译器提前退出：${exit.signal ?? exit.code}；持续 watch 尚未完成。`)
    }
  }
  catch (error) {
    failure = { error }
  }
  finally {
    // spawn 错误可能只有 close；该分支同样显式请求收尾，不假定已经没有后代。
    stop()
    watcher.child.removeListener('exit', onExit)
    try {
      await stopping
    }
    catch (error) {
      failure = { error: failure && failure.error !== error
        ? new AggregateError([failure.error, error], '微信编译器运行与进程停止均失败。', { cause: failure.error })
        : error }
    }
    for (const signal of ['SIGINT', 'SIGTERM'] as const) {
      process.removeListener(signal, handlers[signal])
    }
  }
  if (failure) {
    throw failure.error
  }
}
