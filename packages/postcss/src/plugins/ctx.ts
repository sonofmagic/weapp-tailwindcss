export function createContext() {
  const variablesScopeWeakMap = new WeakMap()
  function isVariablesScope(rule: WeakKey) {
    return variablesScopeWeakMap.get(rule) === true
  }

  function markVariablesScope(rule: WeakKey) {
    variablesScopeWeakMap.set(rule, true)
  }
  return {
    variablesScopeWeakMap,
    isVariablesScope,
    markVariablesScope,
  }
}

export type IContext = ReturnType<typeof createContext>
