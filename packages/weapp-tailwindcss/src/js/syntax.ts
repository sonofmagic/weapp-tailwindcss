const ESM_RE
  = /(?:[\s;]|^)(?:import[\s\w*,{}]*from|import\s*["'*{]|export\b\s*(?:[*{]|default|class|type|function|const|var|let|async function)|import\.meta\b)/m

const CJS_RE
  = /(?:[\s;]|^)(?:module.exports\b|exports\.\w|require\s*\(|global\.\w)/m

const COMMENT_RE = /\/\*.+?\*\/|\/\/.*(?=[nr])/g

// const BUILTIN_EXTENSIONS = new Set(['.mjs', '.cjs', '.node', '.wasm']) // 可能的内置扩展名

/**
 * 检测代码字符串语法的可选项。
 */
export interface DetectSyntaxOptions {
  /**
   * 是否在检测语法前移除代码中的注释。
   * @default false
   */
  stripComments?: boolean
}

/**
 * 判断代码字符串是否包含 ECMAScript Module 语法。
 *
 * @param {string} code - 需要分析的源代码。
 * @param {DetectSyntaxOptions} opts - 详见 {@link DetectSyntaxOptions}。
 * @returns {boolean} 如果包含 ESM 语法返回 `true`，否则返回 `false`。
 */
export function hasESMSyntax(
  code: string,
  opts: DetectSyntaxOptions = {},
): boolean {
  if (opts.stripComments) {
    code = code.replace(COMMENT_RE, '')
  }
  return ESM_RE.test(code)
}

/**
 * 判断代码字符串是否包含 CommonJS 语法。
 *
 * @param {string} code - 需要分析的源代码。
 * @param {DetectSyntaxOptions} opts - 详见 {@link DetectSyntaxOptions}。
 * @returns {boolean} 如果包含 CommonJS 语法则返回 `true`，否则返回 `false`。
 */
export function hasCJSSyntax(
  code: string,
  opts: DetectSyntaxOptions = {},
): boolean {
  if (opts.stripComments) {
    code = code.replace(COMMENT_RE, '')
  }
  return CJS_RE.test(code)
}

/**
 * 分析给定代码是否包含 ECMAScript Module 语法、CommonJS 语法或同时包含两者。
 *
 * @param {string} code - 需要分析的源代码。
 * @param {DetectSyntaxOptions} opts - 详见 {@link DetectSyntaxOptions}。
 * @returns {object} 返回对象包括 `hasESM`、`hasCJS` 与是否混用的 `isMixed`。
 */
export function detectSyntax(code: string, opts: DetectSyntaxOptions = {}) {
  if (opts.stripComments) {
    code = code.replace(COMMENT_RE, '')
  }
  // 注释已提前去除，因此不再向 hasESMSyntax 和 hasCJSSyntax 传递 strip 配置
  const hasESM = hasESMSyntax(code, {})
  const hasCJS = hasCJSSyntax(code, {})

  return {
    hasESM,
    hasCJS,
    isMixed: hasESM && hasCJS,
  }
}
