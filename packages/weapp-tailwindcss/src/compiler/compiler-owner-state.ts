import { AsyncLocalStorage } from 'node:async_hooks'

const compilerOwnerDisposals = new WeakMap<object, Promise<void>>()
const compilerOwnerActivities = new WeakMap<object, {
  active: number
  idleWaiters: Set<() => void>
}>()
const compilerOwnerActivityStorage = new AsyncLocalStorage<ReadonlyMap<object, CompilerOwnerActivityToken>>()

interface CompilerOwnerActivityToken {
  active: boolean
}

interface CompilerOwnerActivityLease {
  release: () => void
  token: CompilerOwnerActivityToken
}

export function ensureCompilerOwnerActive(owner: object) {
  if (compilerOwnerDisposals.has(owner) && !hasCompilerOwnerActivity(owner)) {
    throw new Error('Compiler owner 正在释放，不能创建新的编译状态。')
  }
}

function hasCompilerOwnerActivity(owner: object) {
  return compilerOwnerActivityStorage.getStore()?.get(owner)?.active === true
}

function acquireCompilerOwnerActivity(
  owner: object,
): CompilerOwnerActivityLease | Promise<CompilerOwnerActivityLease> {
  const currentDisposal = compilerOwnerDisposals.get(owner)
  if (currentDisposal && !hasCompilerOwnerActivity(owner)) {
    return currentDisposal.then(() => acquireCompilerOwnerActivity(owner))
  }

  let state = compilerOwnerActivities.get(owner)
  if (!state) {
    state = {
      active: 0,
      idleWaiters: new Set(),
    }
    compilerOwnerActivities.set(owner, state)
  }
  state.active += 1

  let released = false
  const token: CompilerOwnerActivityToken = { active: true }
  return {
    release() {
      if (released) {
        return
      }
      released = true
      token.active = false
      state.active -= 1
      if (state.active > 0) {
        return
      }
      compilerOwnerActivities.delete(owner)
      for (const resolve of state.idleWaiters) {
        resolve()
      }
      state.idleWaiters.clear()
    },
    token,
  }
}

function waitForCompilerOwnerIdle(owner: object) {
  const state = compilerOwnerActivities.get(owner)
  if (!state || state.active === 0) {
    return Promise.resolve()
  }
  return new Promise<void>((resolve) => {
    state.idleWaiters.add(resolve)
  })
}

export function runCompilerOwnerActivity<T>(
  owner: object,
  activity: () => T | Promise<T>,
): Promise<Awaited<T>> {
  const acquired = acquireCompilerOwnerActivity(owner)
  if (acquired instanceof Promise) {
    return acquired.then(lease => runCompilerOwnerActivityWithLease(owner, activity, lease))
  }
  return runCompilerOwnerActivityWithLease(owner, activity, acquired)
}

function runCompilerOwnerActivityWithLease<T>(
  owner: object,
  activity: () => T | Promise<T>,
  lease: CompilerOwnerActivityLease,
): Promise<Awaited<T>> {
  try {
    const currentOwners = compilerOwnerActivityStorage.getStore()
    const owners = currentOwners?.get(owner)?.active
      ? currentOwners
      : new Map([...(currentOwners ?? []), [owner, lease.token]])
    return Promise.resolve(
      compilerOwnerActivityStorage.run(owners, activity),
    ).finally(lease.release)
  }
  catch (error) {
    lease.release()
    return Promise.reject(error)
  }
}

export function runCompilerOwnerDisposal(
  owner: object,
  dispose: () => Promise<void>,
) {
  const currentDisposal = compilerOwnerDisposals.get(owner)
  if (currentDisposal) {
    return currentDisposal
  }
  const disposal = Promise.resolve().then(async () => {
    await waitForCompilerOwnerIdle(owner)
    await dispose()
  }).finally(() => {
    if (compilerOwnerDisposals.get(owner) === disposal) {
      compilerOwnerDisposals.delete(owner)
    }
  })
  compilerOwnerDisposals.set(owner, disposal)
  return disposal
}
