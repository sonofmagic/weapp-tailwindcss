import { VariablesScopeSymbol } from '../symbols'

export function createContext() {
  const variablesScopeWeakMap = new WeakMap()
  function isVariablesScope(rule: WeakKey) {
    return variablesScopeWeakMap.get(rule) === VariablesScopeSymbol
  }

  function markVariablesScope(rule: WeakKey) {
    variablesScopeWeakMap.set(rule, VariablesScopeSymbol)
  }
  return {
    variablesScopeWeakMap,
    isVariablesScope,
    markVariablesScope,
  }
}

export type IContext = ReturnType<typeof createContext>
