import type { HmrContext, ModuleNode } from 'vite'
import { cleanUrl } from '@/bundlers/vite/utils'

function isStyleModule(mod: ModuleNode) {
  const request = mod.id ?? mod.url
  return typeof request === 'string' && /[?&](?:vue&)?type=style(?:&|$)/.test(request)
}

export function createUniAppXWebLocalStyleBridge(isEnabled: () => boolean) {
  const rulesByFile = new Map<string, string>()

  return {
    appendToStyle(code: string, id: string) {
      if (!isEnabled()) {
        return code
      }
      const rules = rulesByFile.get(cleanUrl(id))
      return rules ? `${code}\n${rules}` : code
    },
    handleHotUpdate(ctx: HmrContext) {
      if (!isEnabled() || !/\.(?:uvue|nvue)$/i.test(cleanUrl(ctx.file))) {
        return
      }
      const styleModules = [...ctx.server.moduleGraph.getModulesByFile?.(ctx.file) ?? []]
        .filter(isStyleModule)
      if (styleModules.length === 0) {
        return
      }
      for (const mod of styleModules) {
        ctx.server.moduleGraph.invalidateModule(mod)
      }
      return [...new Set([...ctx.modules, ...styleModules])]
    },
    remember(id: string, rules: string) {
      rulesByFile.set(cleanUrl(id), rules)
    },
  }
}
