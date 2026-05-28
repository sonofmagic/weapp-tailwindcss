const isWebHmrRegression = process.env.WEAPP_TW_WATCH_REGRESSION === '1' && process.env.TARO_ENV === 'h5'

export default {
  plugins: {
    // Tailwind CSS 由 weapp-tailwindcss 生成模式接管
    ...(isWebHmrRegression
      ? {
          'weapp-tailwindcss/postcss': {
            generator: {
              target: 'web',
            },
          },
        }
      : {}),
  }
}
