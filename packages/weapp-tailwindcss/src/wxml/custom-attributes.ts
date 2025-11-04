import type { ICustomAttributesEntities, ItemOrItemArray } from '@/types'

export type AttributeMatcher = (tag: string, attr: string) => boolean

function regTest(reg: RegExp, str: string) {
  reg.lastIndex = 0
  return reg.test(str)
}

export function isPropsMatch(props: ItemOrItemArray<string | RegExp>, attr: string) {
  if (Array.isArray(props)) {
    let lowerAttr: string | undefined
    for (const prop of props) {
      if (typeof prop === 'string') {
        lowerAttr ??= attr.toLowerCase()
        if (prop.toLowerCase() === lowerAttr) {
          return true
        }
      }
      else if (regTest(prop, attr)) {
        return true
      }
    }
    return false
  }
  else if (typeof props === 'string') {
    return props === attr
  }
  else {
    return regTest(props, attr)
  }
}

export function createAttributeMatcher(entities?: ICustomAttributesEntities): AttributeMatcher | undefined {
  if (!entities || entities.length === 0) {
    return undefined
  }

  const wildcardAttributeRules: ItemOrItemArray<string | RegExp>[] = []
  const tagAttributeRuleMap = new Map<string, ItemOrItemArray<string | RegExp>[]>()
  const regexpAttributeRules: Array<[RegExp, ItemOrItemArray<string | RegExp>]> = []

  for (const [selector, props] of entities) {
    if (selector === '*') {
      wildcardAttributeRules.push(props)
    }
    else if (typeof selector === 'string') {
      const list = tagAttributeRuleMap.get(selector)
      if (list) {
        list.push(props)
      }
      else {
        tagAttributeRuleMap.set(selector, [props])
      }
    }
    else {
      regexpAttributeRules.push([selector, props])
    }
  }

  return (tag: string, attr: string) => {
    for (const props of wildcardAttributeRules) {
      if (isPropsMatch(props, attr)) {
        return true
      }
    }
    const tagRules = tagAttributeRuleMap.get(tag)
    if (tagRules) {
      for (const props of tagRules) {
        if (isPropsMatch(props, attr)) {
          return true
        }
      }
    }
    for (const [selector, props] of regexpAttributeRules) {
      if (regTest(selector, tag) && isPropsMatch(props, attr)) {
        return true
      }
    }
    return false
  }
}
