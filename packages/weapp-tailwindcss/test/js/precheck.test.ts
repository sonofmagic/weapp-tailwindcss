import { afterEach, describe, expect, it } from 'vitest'
import { shouldSkipJsTransform } from '@/js/precheck'
import { shouldSkipViteJsTransform } from '@/bundlers/vite/js-precheck'

describe('shouldSkipJsTransform', () => {
  describe('空字符串返回 true（可跳过）', () => {
    it('空字符串', () => {
      expect(shouldSkipJsTransform('')).toBe(true)
    })
  })

  describe('纯数字/无类名模式的代码返回 true', () => {
    it('纯数字赋值', () => {
      expect(shouldSkipJsTransform('const answer = 42')).toBe(true)
    })

    it('简单算术表达式', () => {
      expect(shouldSkipJsTransform('const sum = 1 + 2 + 3')).toBe(true)
    })

    it('无类名模式的函数', () => {
      expect(shouldSkipJsTransform('function add(a, b) { return a + b }')).toBe(true)
    })
  })

  describe('含类名相关关键字的代码返回 false', () => {
    it.each([
      ['className', 'el.className = "flex"'],
      ['classList', 'el.classList.add("hidden")'],
      ['twMerge', 'twMerge("p-4", "p-2")'],
      ['clsx', 'clsx("flex", active && "bg-red")'],
      ['classnames', 'classnames("a", "b")'],
      ['cn', 'cn("flex", "items-center")'],
      ['cva', 'cva("base", { variants: {} })'],
    ])('%s', (_label, code) => {
      expect(shouldSkipJsTransform(code)).toBe(false)
    })
  })

  describe('含 Tailwind 任意值语法的代码返回 false', () => {
    it('text-[', () => {
      expect(shouldSkipJsTransform('const cls = "text-[#123456]"')).toBe(false)
    })

    it('bg-[', () => {
      expect(shouldSkipJsTransform('const cls = "bg-[url(img.png)]"')).toBe(false)
    })
  })

  describe('含 import/export/require 语句的代码返回 false', () => {
    it('import 语句（命名导入）', () => {
      expect(shouldSkipJsTransform('import { foo } from "bar"')).toBe(false)
    })

    it('import 语句（字符串导入）', () => {
      expect(shouldSkipJsTransform('import "bar"')).toBe(false)
    })

    it('import 语句（星号导入）', () => {
      expect(shouldSkipJsTransform('import * as bar from "baz"')).toBe(false)
    })

    it('export 语句', () => {
      expect(shouldSkipJsTransform('export * from "module"')).toBe(false)
    })

    it('require 调用', () => {
      expect(shouldSkipJsTransform('const m = require("mod")')).toBe(false)
    })

    it('export { } from 语句', () => {
      expect(shouldSkipJsTransform('export { foo } from "bar"')).toBe(false)
    })
  })

  describe('选项强制不跳过', () => {
    it('alwaysEscape: true 时返回 false', () => {
      expect(shouldSkipJsTransform('const x = 1', { alwaysEscape: true })).toBe(false)
    })

    it('moduleSpecifierReplacements 有条目时返回 false', () => {
      expect(shouldSkipJsTransform('const x = 1', {
        moduleSpecifierReplacements: { './a': './b' },
      })).toBe(false)
    })

    it('wrapExpression: true 时返回 false', () => {
      expect(shouldSkipJsTransform('const x = 1', { wrapExpression: true })).toBe(false)
    })
  })

  describe('环境变量 WEAPP_TW_DISABLE_JS_PRECHECK', () => {
    afterEach(() => {
      delete process.env.WEAPP_TW_DISABLE_JS_PRECHECK
    })

    it('设置为 "1" 时返回 false', () => {
      process.env.WEAPP_TW_DISABLE_JS_PRECHECK = '1'
      expect(shouldSkipJsTransform('const x = 1')).toBe(false)
    })

    it('未设置时正常执行预检查', () => {
      expect(shouldSkipJsTransform('const x = 1')).toBe(true)
    })
  })

  describe('re-export 兼容性', () => {
    it('shouldSkipViteJsTransform 与 shouldSkipJsTransform 行为一致', () => {
      const cases = [
        '',
        'const x = 42',
        'el.className = "flex"',
        'import foo from "bar"',
        'const cls = "text-[#fff]"',
      ]
      for (const code of cases) {
        expect(shouldSkipViteJsTransform(code)).toBe(shouldSkipJsTransform(code))
      }
    })
  })
})
