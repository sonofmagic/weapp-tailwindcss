function quoteCssString(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}

function toCssPath(value: string) {
  return value.replaceAll('\\', '/')
}

export function prependConfigDirective(css: string, config: string | undefined) {
  if (!config || /@config\s+/.test(css)) {
    return css
  }
  return `@config "${quoteCssString(toCssPath(config))}";\n${css}`
}
