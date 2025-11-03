export async function runWithConcurrency<T>(
  factories: Array<() => Promise<T>>,
  limit = Math.min(4, Math.max(1, factories.length)),
): Promise<T[]> {
  if (factories.length === 0) {
    return []
  }

  const results: T[] = Array.from({ length: factories.length })
  const executing = new Set<Promise<void>>()
  let cursor = 0
  const effectiveLimit = Math.max(1, limit)

  const scheduleNext = () => {
    if (cursor >= factories.length) {
      return
    }
    const currentIndex = cursor++
    const wrapped = Promise.resolve(factories[currentIndex]()).then((value) => {
      results[currentIndex] = value
    }).finally(() => {
      executing.delete(wrapped)
    })
    executing.add(wrapped)
  }

  while (cursor < factories.length && executing.size < effectiveLimit) {
    scheduleNext()
  }

  while (cursor < factories.length) {
    await Promise.race(executing)
    scheduleNext()
  }

  await Promise.all(executing)
  return results
}
