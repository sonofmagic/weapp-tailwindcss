const compilerOwnerDisposals = new WeakMap<object, Promise<void>>()

export function ensureCompilerOwnerActive(owner: object) {
  if (compilerOwnerDisposals.has(owner)) {
    throw new Error('Compiler owner 正在释放，不能创建新的编译状态。')
  }
}

export function getPendingCompilerOwnerDisposal(owner: object) {
  return compilerOwnerDisposals.get(owner)
}

export function runCompilerOwnerDisposal(
  owner: object,
  dispose: () => Promise<void>,
) {
  const currentDisposal = compilerOwnerDisposals.get(owner)
  if (currentDisposal) {
    return currentDisposal
  }
  const disposal = Promise.resolve().then(dispose).finally(() => {
    if (compilerOwnerDisposals.get(owner) === disposal) {
      compilerOwnerDisposals.delete(owner)
    }
  })
  compilerOwnerDisposals.set(owner, disposal)
  return disposal
}
