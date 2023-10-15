import plugin from 'tailwindcss/plugin'

export interface Options {
  static?: boolean
  dynamic?: boolean
}

export default plugin.withOptions((options: Options) => {
  const { dynamic: dynamicMode, static: staticMode } = options ?? {}
  return ({ matchVariant, addVariant }) => {
    if (staticMode) {
    }
    // addVariant,
    // addVariant('wx', '@media(weapp-tw-platform:MP-WEIXIN){&}')
    // addVariant('-wx', '@media not screen and (weapp-tw-platform:MP-WEIXIN){&}')
    if (dynamicMode) {
      // matchVariant()
    }
    // ifdef
    // ifndef
  }
})
