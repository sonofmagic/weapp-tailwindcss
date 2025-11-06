// 预处理阶段插件：重写选择器、清理不兼容规则并注入变量
import type { AtRule, Plugin, PluginCreator } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { defu } from '@weapp-tailwindcss/shared'
import { postcssPlugin } from '../constants'
import { commonChunkPreflight } from '../mp'
import { ruleTransformSync } from '../selectorParser'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

// isAtMediaHover 用于识别 hover 媒体查询并将其展开
function isAtMediaHover(atRule: AtRule) {
  return (
    /media\(\s*hover\s*:\s*hover\s*\)/.test(atRule.name)
    || (atRule.name === 'media' && /\(\s*hover\s*:\s*hover\s*\)/.test(atRule.params))
  )
}

// @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {
//   @layer base {
//     *, :before, :after, ::backdrop {
//       --tw-font-weight: initial;
//     }
//   }
// }
// (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b))))

// @layer properties {
//   @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))) {
//     *, ::before, ::after, ::backdrop {
//       --tw-shadow: 0 0 #0000;
//       --tw-shadow-color: initial;
//       --tw-shadow-alpha: 100%;
//       --tw-inset-shadow: 0 0 #0000;
//       --tw-inset-shadow-color: initial;
//       --tw-inset-shadow-alpha: 100%;
//       --tw-ring-color: initial;
//       --tw-ring-shadow: 0 0 #0000;
//       --tw-inset-ring-color: initial;
//       --tw-inset-ring-shadow: 0 0 #0000;
//       --tw-ring-inset: initial;
//       --tw-ring-offset-width: 0px;
//       --tw-ring-offset-color: #fff;
//       --tw-ring-offset-shadow: 0 0 #0000;
//       --tw-blur: initial;
//       --tw-brightness: initial;
//       --tw-contrast: initial;
//       --tw-grayscale: initial;
//       --tw-hue-rotate: initial;
//       --tw-invert: initial;
//       --tw-opacity: initial;
//       --tw-saturate: initial;
//       --tw-sepia: initial;
//       --tw-drop-shadow: initial;
//       --tw-drop-shadow-color: initial;
//       --tw-drop-shadow-alpha: 100%;
//       --tw-drop-shadow-size: initial;
//       --tw-content: "";
//     }
//   }
// }
// Tailwind v4 的现代检查语句需要特殊处理以恢复具体规则
export function isTailwindcssV4ModernCheck(atRule: AtRule) {
  return atRule.name === 'supports' && [
    /-webkit-hyphens\s*:\s*none/,
    /margin-trim\s*:\s*inline/,
    /-moz-orient\s*:\s*inline/,
    /color\s*:\s*rgb\(\s*from\s+red\s+r\s+g\s+b\s*\)/,
  ].every(regex => regex.test(atRule.params))
}

const postcssWeappTailwindcssPrePlugin: PostcssWeappTailwindcssRenamePlugin = (
  options,
) => {
  const opts = defu(options, { isMainChunk: true })

  const p: Plugin = {
    postcssPlugin,
    Rule(rule) {
      // 统一通过 selectorParser 做兼容性替换
      ruleTransformSync(rule, opts)
    },
    AtRule(atRule) {
      if (isAtMediaHover(atRule)) {
        if (atRule.nodes) {
          atRule.replaceWith(atRule.nodes)
        }
        else {
          atRule.remove()
        }
      }
      // 参考：https://github.com/sonofmagic/weapp-tailwindcss/issues/631
      // 参考：https://github.com/sonofmagic/weapp-tailwindcss/issues/632
      // 参考：https://developer.mozilla.org/zh-CN/docs/Web/CSS/color_value/color-mix
      else if (atRule.name === 'supports') {
        if (/color-mix/.test(atRule.params)) {
          atRule.remove()
        }
      }
      else if (atRule.name === 'layer') {
        if (atRule.nodes === undefined || (Array.isArray(atRule.nodes) && atRule.nodes.length === 0)) {
          atRule.remove()
        }
      }
    },
  }
  if (opts.isMainChunk) {
    let layerProperties: AtRule
    p.Once = (root) => {
      root.walkAtRules((atRule) => {
        // 针对 Tailwindcss V4.1.2 的处理
        if (atRule.name === 'layer') {
          if (atRule.params === 'properties') {
            if (atRule.nodes === undefined || atRule.nodes?.length === 0) {
              layerProperties = atRule // 暂存空 properties 节
            }
            else if (atRule.first?.type === 'atrule' && isTailwindcssV4ModernCheck(atRule.first)) {
              if (layerProperties) {
                layerProperties.replaceWith(atRule.first.nodes)
                atRule.remove()
              }
              else {
                atRule.replaceWith(atRule.first.nodes)
              }
            }
          }
          else {
            atRule.replaceWith(atRule.nodes)
          }
        }
        // 针对 Tailwindcss V4.1.1 的处理
        else if (isTailwindcssV4ModernCheck(atRule)) {
          if (atRule.first?.type === 'atrule' && atRule.first.name === 'layer') {
            atRule.replaceWith(atRule.first.nodes)
          }
        }
      })
      root.walkRules((rule) => {
        commonChunkPreflight(rule, opts)
      })
    }
  }
  return p
}

postcssWeappTailwindcssPrePlugin.postcss = true

export { postcssWeappTailwindcssPrePlugin }
