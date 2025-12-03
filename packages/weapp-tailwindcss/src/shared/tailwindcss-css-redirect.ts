import Module from 'node:module'
import path from 'node:path'

type ResolveFilenameFn = (
  request: string,
  parent?: any,
  isMain?: boolean,
  options?: any,
) => string

const moduleWithMutableResolve = Module as typeof Module & { _resolveFilename: ResolveFilenameFn }
const patched = new WeakSet<ResolveFilenameFn>()

export function installTailwindcssCssRedirect(pkgDir: string) {
  const target = path.join(pkgDir, 'index.css')
  const original = moduleWithMutableResolve._resolveFilename as ResolveFilenameFn
  if (patched.has(original)) {
    return
  }
  const replacements = new Set(['tailwindcss', 'tailwindcss$'])
  const resolveTailwindcssCss: ResolveFilenameFn = (request, parent, isMain, options) => {
    if (replacements.has(request)) {
      return target
    }
    if (request.startsWith('tailwindcss/')) {
      return path.join(pkgDir, request.slice('tailwindcss/'.length))
    }
    return original(request, parent, isMain, options)
  }
  moduleWithMutableResolve._resolveFilename = resolveTailwindcssCss
  patched.add(moduleWithMutableResolve._resolveFilename)
}
