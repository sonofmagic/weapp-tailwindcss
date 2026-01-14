/**
 * Experimental shared helpers for SWC/OXC POCs.
 * These helpers intentionally mirror the light‑weight, token‑based writeback
 * strategy used by the Babel implementation to avoid re-printing the AST and
 * preserve original formatting.
 *
 * NOTE: These files are not wired into the public build. They are here as POCs.
 * To run them, you must add the corresponding deps (@swc/core or an OXC parser)
 * and write a tiny harness in your app/tests.
 */
export { getPattern, getReplacement } from './shared/cache'
export { shouldTransformClassName, transformLiteralText } from './shared/transform'

export function createToken(
  start: number,
  end: number,
  value: string,
): { start: number, end: number, value: string } {
  return { start, end, value }
}

/**
 * Basic matcher for identifiers (string or RegExp array), copied from the
 * name matcher used in Babel path walker, but simplified to avoid extra deps.
 */
export function createNameMatcher(
  patterns: (string | RegExp)[] | undefined,
  exact = true,
) {
  const arr = patterns ?? []
  return (name: string) => {
    for (const p of arr) {
      if (typeof p === 'string') {
        if (exact ? name === p : name.includes(p)) {
          return true
        }
      }
      else if (p.test(name)) {
        return true
      }
    }
    return false
  }
}
