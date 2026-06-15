export function createBundleTaskTimer(
  recordTimingDetail: (name: string, startedAt: number) => void,
) {
  return async (name: string, task: () => Promise<void>) => {
    const start = performance.now()
    try {
      await task()
    }
    finally {
      recordTimingDetail(`tasks.${name}`, start)
    }
  }
}
