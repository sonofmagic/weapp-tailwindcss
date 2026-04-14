import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import fc from 'fast-check'
import { shouldSkipJsTransform } from '@/js/precheck'
import { shouldSkipViteJsTransform } from '@/bundlers/vite/js-precheck'

// ---------------------------------------------------------------------------
// 辅助：生成器
// ---------------------------------------------------------------------------

/** 生成随机 CreateJsHandlerOptions（不含强制选项） */
function arbOptions() {
  return fc.record({
    alwaysEscape: fc.constantFrom(undefined, false),
    wrapExpression: fc.constantFrom(undefined, false),
    moduleSpecifierReplacements: fc.constantFrom(undefined, {}),
    staleClassNameFallback: fc.option(fc.boolean(), { nil: undefined }),
    tailwindcssMajorVersion: fc.option(fc.constantFrom(3, 4), { nil: undefined }),
    filename: fc.option(fc.string(), { nil: undefined }),
  }, { requiredKeys: [] })
}

/** 生成随机 CreateJsHandlerOptions（含可能的强制选项） */
function arbAnyOptions() {
  return fc.record({
    alwaysEscape: fc.option(fc.boolean(), { nil: undefined }),
    wrapExpression: fc.option(fc.boolean(), { nil: undefined }),
    moduleSpecifierReplacements: fc.option(
      fc.oneof(
        fc.constant({}),
        fc.constant({ './a': './b' }),
        fc.constant(undefined),
      ),
      { nil: undefined },
    ),
    staleClassNameFallback: fc.option(fc.boolean(), { nil: undefined }),
    tailwindcssMajorVersion: fc.option(fc.constantFrom(3, 4), { nil: undefined }),
    filename: fc.option(fc.string(), { nil: undefined }),
  }, { requiredKeys: [] })
}

/**
 * 安全字母表：仅包含不会意外形成匹配模式的字符。
 * 排除所有可能组成 class/import/export/require/twMerge/clsx/classnames/cn/cva/text-[/bg-[ 的字母。
 * 使用数字、运算符、空白和少量安全标识符字符。
 */
const SAFE_CHARS = '0123456789+-*/=(){}; \t\n,.|&^~!?@#$%'

/** 生成不含任何匹配模式的安全源码 */
function arbSafeSource() {
  return fc.array(
    fc.constantFrom(...SAFE_CHARS.split('')),
    { minLength: 1, maxLength: 200 },
  ).map(arr => arr.join(''))
}

/** 生成含强制选项之一的选项 */
function arbForceOptions() {
  return fc.oneof(
    fc.constant({ alwaysEscape: true }),
    fc.constant({ moduleSpecifierReplacements: { './a': './b' } }),
    fc.constant({ moduleSpecifierReplacements: { 'foo': 'bar', 'baz': 'qux' } }),
    fc.constant({ wrapExpression: true }),
  )
}

/** import/export/require 语句模板 */
const DEPENDENCY_TEMPLATES = [
  (id: string) => `import { ${id} } from "module"`,
  (id: string) => `import "${id}"`,
  (id: string) => `import * as ${id} from "pkg"`,
  (_id: string) => `import("dynamic")`,
  (_id: string) => `const m = require("mod")`,
  (_id: string) => `export * from "module"`,
  (_id: string) => `export { foo } from "bar"`,
  (id: string) => `import \`${id}\``,
]

/** 生成含依赖语句的源码 */
function arbSourceWithDependency() {
  return fc.tuple(
    fc.constantFrom(...DEPENDENCY_TEMPLATES),
    fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 10 }),
    fc.array(fc.constantFrom(...'0123456789+-*/= \n'.split('')), { minLength: 0, maxLength: 50 }),
  ).map(([tmpl, idArr, suffixArr]) => `${tmpl(idArr.join(''))}\n${suffixArr.join('')}`)
}

/** 类名模式关键字 */
const CLASS_PATTERNS = [
  'className = "flex"',
  'el.classList.add("hidden")',
  'twMerge("p-4", "p-2")',
  'clsx("flex", active)',
  'classnames("a", "b")',
  'cn("flex", "items-center")',
  'cva("base", { variants: {} })',
  '"text-[#123456]"',
  '"bg-[url(img.png)]"',
  'class = "flex"',
  '[\"class\"]',
  "['class']",
  '[`class`]',
]

/** 生成含类名模式的源码 */
function arbSourceWithClassPattern() {
  // 使用非单词字符作为前缀/后缀，确保 \b 单词边界能正确匹配
  return fc.tuple(
    fc.constantFrom(...CLASS_PATTERNS),
    fc.array(fc.constantFrom(...'+-*/= \n;,'.split('')), { minLength: 0, maxLength: 30 }),
    fc.array(fc.constantFrom(...'+-*/= \n;,'.split('')), { minLength: 0, maxLength: 30 }),
  ).map(([pattern, prefixArr, suffixArr]) => `${prefixArr.join('')}${pattern}${suffixArr.join('')}`)
}

// ===========================================================================
// Property 1: 迁移等价性
// ===========================================================================

describe('Feature: js-precheck-universal, Property 1: 迁移等价性', () => {
  /**
   * **Validates: Requirements 1.3, 7.4**
   *
   * 对于任意 JS 源码字符串和任意 CreateJsHandlerOptions 配置，
   * shouldSkipJsTransform 与 shouldSkipViteJsTransform 返回值一致。
   */
  it('shouldSkipJsTransform 与 shouldSkipViteJsTransform 对任意输入返回一致结果', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 500 }),
        arbAnyOptions(),
        (source, options) => {
          expect(shouldSkipJsTransform(source, options)).toBe(shouldSkipViteJsTransform(source, options))
        },
      ),
      { numRuns: 100 },
    )
  })
})

// ===========================================================================
// Property 2: 强制选项阻止跳过
// ===========================================================================

describe('Feature: js-precheck-universal, Property 2: 强制选项阻止跳过', () => {
  /**
   * **Validates: Requirements 2.2, 2.3, 2.4**
   *
   * 对于任意非空源码，当设置 alwaysEscape/moduleSpecifierReplacements/wrapExpression 时，
   * shouldSkipJsTransform 返回 false。
   */
  it('设置强制选项时始终返回 false', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        arbForceOptions(),
        (source, options) => {
          expect(shouldSkipJsTransform(source, options)).toBe(false)
        },
      ),
      { numRuns: 100 },
    )
  })
})

// ===========================================================================
// Property 3: 依赖语句阻止跳过
// ===========================================================================

describe('Feature: js-precheck-universal, Property 3: 依赖语句阻止跳过', () => {
  /**
   * **Validates: Requirements 2.5, 7.2**
   *
   * 对于含 import/export/require 语句的源码（无强制选项），
   * shouldSkipJsTransform 返回 false。
   */
  it('含依赖语句的源码始终返回 false', () => {
    fc.assert(
      fc.property(
        arbSourceWithDependency(),
        (source) => {
          expect(shouldSkipJsTransform(source)).toBe(false)
        },
      ),
      { numRuns: 100 },
    )
  })
})

// ===========================================================================
// Property 4: 类名模式阻止跳过
// ===========================================================================

describe('Feature: js-precheck-universal, Property 4: 类名模式阻止跳过', () => {
  /**
   * **Validates: Requirements 2.6, 7.1, 7.3**
   *
   * 对于含 className/classList/twMerge/clsx/classnames/cn/cva/text-[/bg-[ 等模式的源码，
   * shouldSkipJsTransform 返回 false。
   */
  it('含类名模式的源码始终返回 false', () => {
    fc.assert(
      fc.property(
        arbSourceWithClassPattern(),
        (source) => {
          expect(shouldSkipJsTransform(source)).toBe(false)
        },
      ),
      { numRuns: 100 },
    )
  })
})

// ===========================================================================
// Property 5: 无匹配则跳过
// ===========================================================================

describe('Feature: js-precheck-universal, Property 5: 无匹配则跳过', () => {
  /**
   * **Validates: Requirements 2.7**
   *
   * 对于不含任何匹配模式的非空源码（无强制选项），
   * shouldSkipJsTransform 返回 true。
   */
  it('不含匹配模式的安全源码始终返回 true', () => {
    fc.assert(
      fc.property(
        arbSafeSource(),
        (source) => {
          expect(shouldSkipJsTransform(source)).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })
})

// ===========================================================================
// Property 6: 环境变量禁用预检查
// ===========================================================================

describe('Feature: js-precheck-universal, Property 6: 环境变量禁用预检查', () => {
  beforeEach(() => {
    process.env.WEAPP_TW_DISABLE_JS_PRECHECK = '1'
  })

  afterEach(() => {
    delete process.env.WEAPP_TW_DISABLE_JS_PRECHECK
  })

  /**
   * **Validates: Requirements 8.1**
   *
   * 当环境变量 WEAPP_TW_DISABLE_JS_PRECHECK=1 时，
   * 对于任意源码，shouldSkipJsTransform 返回 false。
   */
  it('环境变量设置为 1 时始终返回 false', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 500 }),
        (source) => {
          expect(shouldSkipJsTransform(source)).toBe(false)
        },
      ),
      { numRuns: 100 },
    )
  })
})
