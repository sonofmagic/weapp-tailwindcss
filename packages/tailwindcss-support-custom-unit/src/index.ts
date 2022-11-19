import plugin from 'tailwindcss/plugin'

export default plugin.withOptions((options) => {
  return ({ matchUtilities, theme }) => {
    // const themeText = theme('text')
    matchUtilities(
      {
        // border: (value) => {
        //   return {
        //     border: value
        //   }
        // },
        text: (value) => {
          return {
            fontSize: value
          }
        }
      }
      // { values: themeText }
    )

    matchUtilities(
      {
        tab: (value) => ({
          tabSize: value
        })
      },
      { values: theme('tabSize') }
    )
  }
})
