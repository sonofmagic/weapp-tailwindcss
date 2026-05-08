
module.exports = function config(loaderContext) {
  return {
    plugins: {
      // Tailwind CSS 由 weapp-tailwindcss 生成模式接管，这里不要再注册 tailwindcss
      autoprefixer: {},
    }
  }
}
