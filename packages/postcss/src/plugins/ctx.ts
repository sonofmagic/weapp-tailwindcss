// 插件共享上下文，用于记录变量作用域等状态
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
