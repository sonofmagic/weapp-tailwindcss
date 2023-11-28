export function createContext() {
  return {
    variablesScopeWeakMap: new WeakMap()
  }
}

export type IContext = ReturnType<typeof createContext>
