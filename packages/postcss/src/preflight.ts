// 该模块负责将用户配置的预设样式值转换为可注入的声明列表
import type { CssPreflightOptions, IPropValue } from './types'

export type InjectPreflight = () => IPropValue[]

// createInjectPreflight 会在初始化阶段收集所有需要注入的声明，并返回懒执行函数以便复用结果
export function createInjectPreflight(options?: CssPreflightOptions): InjectPreflight {
  const result: IPropValue[] = []
  // if options false ,do no thing
  if (options && typeof options === 'object') {
    // 仅当配置为对象时，才将其键值对转换为待注入的样式条目
    const entries = Object.entries(options)
    for (const [prop, value] of entries) {
      if (value !== false) {
        result.push({
          prop,
          value: value.toString(),
        })
      }
    }
  }

  return () => {
    return result
  }
}
