const officialPostcssParityEnv = 'WEAPP_TW_OFFICIAL_POSTCSS_PARITY'

function isOfficialPostcssParity() {
  return process.env[officialPostcssParityEnv] === '1'
}

function createTailwindImportParityPlugin() {
  return {
    postcssPlugin: 'weapp-tw-demo-official-postcss-parity-import',
    Once(root) {
      root.walkAtRules('import', (atRule) => {
        const match = atRule.params.match(/^(['"])tailwindcss\1(?<suffix>\s.*)?$/)
        if (!match) {
          return
        }
        const suffix = match.groups?.suffix ?? ''
        atRule.replaceWith(
          atRule.clone({ params: `"tailwindcss/theme"${suffix}` }),
          atRule.clone({ params: `"tailwindcss/utilities"${suffix}` }),
        )
      })
    },
  }
}

function createOfficialPostcssParityPlugins() {
  if (!isOfficialPostcssParity()) {
    return []
  }
  const tailwindcssPostcss = require('@tailwindcss/postcss')
  return [
    createTailwindImportParityPlugin(),
    tailwindcssPostcss({
      optimize: false,
    }),
  ]
}

function createOfficialPostcssParityPostcssOptions() {
  const plugins = createOfficialPostcssParityPlugins()
  return plugins.length > 0 ? { plugins } : undefined
}

module.exports = {
  createOfficialPostcssParityPostcssOptions,
  createOfficialPostcssParityPlugins,
  isOfficialPostcssParity,
}
