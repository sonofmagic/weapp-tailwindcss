import path from 'node:path'
import { pluginName } from '@/constants'

const CSS_EXT_RE = /\.(?:css|scss|sass|less|styl|pcss)$/i

interface BeforeResolveData {
  request?: string
  contextInfo?: {
    issuer?: string
  }
}

function stripResourceQuery(file: string) {
  let idx = file.indexOf('?')
  if (idx === -1) {
    idx = file.indexOf('&')
  }
  return idx === -1 ? file : file.slice(0, idx)
}

function rewriteTailwindcssRequestForCss(data: BeforeResolveData | undefined, pkgDir: string) {
  if (!data) {
    return
  }
  let request = data.request
  if (!request) {
    return
  }
  if (request !== 'tailwindcss' && request !== 'tailwindcss$' && !request.startsWith('tailwindcss/')) {
    return
  }

  const issuer = data.contextInfo?.issuer
  if (!issuer) {
    return
  }
  const normalizedIssuer = stripResourceQuery(issuer)
  if (!CSS_EXT_RE.test(normalizedIssuer)) {
    return
  }

  if (request === 'tailwindcss$') {
    request = 'tailwindcss'
  }

  const subpath = request === 'tailwindcss' ? 'index.css' : request.slice('tailwindcss/'.length)
  data.request = path.join(pkgDir, subpath)
}

export function applyTailwindcssCssImportRewrite(
  compiler: any,
  options: { pkgDir: string, enabled: boolean },
) {
  if (!options.enabled) {
    return
  }

  compiler.hooks.normalModuleFactory.tap(pluginName, (factory: any) => {
    factory.hooks.beforeResolve.tap(pluginName, (data: BeforeResolveData | undefined) => {
      rewriteTailwindcssRequestForCss(data, options.pkgDir)
    })
  })
}
