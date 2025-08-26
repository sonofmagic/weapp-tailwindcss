/* eslint-disable ts/no-unused-vars */
import type { AcceptedPlugin, Plugin } from 'postcss'
import { defu } from '@weapp-tailwindcss/shared'

function isPostcssPlugin(postcssPlugin: string | Plugin): postcssPlugin is Plugin {
  return typeof postcssPlugin !== 'string'
}

function createMixin(name: string): Partial<Plugin> {
  return {
    Once() {
      console.log(`${name} Once`)
    },
    OnceExit() {
      console.log(`${name} OnceExit`)
    },
    Root() {
      console.log(`${name} Root`)
    },
    RootExit() {
      console.log(`${name} RootExit`)
    },
    Rule() {
      console.log(`${name} Rule`)
    },
    RuleExit() {
      console.log(`${name} RuleExit`)
    },
    AtRule(atRule, helper) {
      console.log(`${name} AtRule`)
    },
    AtRuleExit(atRule, helper) {
      console.log(`${name} AtRuleExit`)
    },
    Comment(comment, helper) {
      console.log(`${name} Comment`)
    },
    CommentExit(comment, helper) {
      console.log(`${name} CommentExit`)
    },
    Declaration(decl, helper) {
      console.log(`${name} Declaration`)
    },
    DeclarationExit(decl, helper) {
      console.log(`${name} DeclarationExit`)
    },
    Document(document, helper) {
      console.log(`${name} Document`)
    },
    DocumentExit(document, helper) {
      console.log(`${name} DocumentExit`)
    },
  }
}

export function createPlugin(postcssPlugin: string | Plugin): Plugin {
  const isPlugin = isPostcssPlugin(postcssPlugin)
  let plugin: Plugin
  if (isPlugin) {
    plugin = defu<Plugin, Plugin[]>(postcssPlugin, {
      postcssPlugin: postcssPlugin.postcssPlugin,
      ...createMixin(postcssPlugin.postcssPlugin),
    })
  }
  else {
    plugin = defu<Plugin, Plugin[]>({
      postcssPlugin,
      ...createMixin(postcssPlugin),
    })
  }
  return plugin as Plugin
}

export function createPlugins(postcssPlugins: (string | Plugin)[]): AcceptedPlugin[] {
  return postcssPlugins.map(createPlugin)
}
