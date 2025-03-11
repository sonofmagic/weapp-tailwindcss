const ESM_RE
  = /(?:[\s;]|^)(?:import[\s\w*,{}]*from|import\s*["'*{]|export\b\s*(?:[*{]|default|class|type|function|const|var|let|async function)|import\.meta\b)/m

const CJS_RE
  = /(?:[\s;]|^)(?:module.exports\b|exports\.\w|require\s*\(|global\.\w)/m

const COMMENT_RE = /\/\*.+?\*\/|\/\/.*(?=[nr])/g

// const BUILTIN_EXTENSIONS = new Set(['.mjs', '.cjs', '.node', '.wasm'])

/**
 * Options for detecting syntax within a code string.
 */
export interface DetectSyntaxOptions {
  /**
   * Indicates whether comments should be stripped from the code before syntax checking.
   * @default false
   */
  stripComments?: boolean
}

/**
 * Determines if a given code string contains ECMAScript module syntax.
 *
 * @param {string} code - The source code to analyse.
 * @param {DetectSyntaxOptions} opts - See {@link DetectSyntaxOptions}.
 * @returns {boolean} `true` if the code contains ESM syntax, otherwise `false`.
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
 * Determines if a given string of code contains CommonJS syntax.
 *
 * @param {string} code - The source code to analyse.
 * @param {DetectSyntaxOptions} opts - See {@link DetectSyntaxOptions}.
 * @returns {boolean} `true` if the code contains CommonJS syntax, `false` otherwise.
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
 * Analyses the supplied code to determine if it contains ECMAScript module syntax, CommonJS syntax, or both.
 *
 * @param {string} code - The source code to analyse.
 * @param {DetectSyntaxOptions} opts - See {@link DetectSyntaxOptions}.
 * @returns {object} An object indicating the presence of ESM syntax (`hasESM`), CJS syntax (`hasCJS`) and whether both syntaxes are present (`isMixed`).
 */
export function detectSyntax(code: string, opts: DetectSyntaxOptions = {}) {
  if (opts.stripComments) {
    code = code.replace(COMMENT_RE, '')
  }
  // We strip comments once hence not passing opts down to hasESMSyntax and hasCJSSyntax
  const hasESM = hasESMSyntax(code, {})
  const hasCJS = hasCJSSyntax(code, {})

  return {
    hasESM,
    hasCJS,
    isMixed: hasESM && hasCJS,
  }
}
