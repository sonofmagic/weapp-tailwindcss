module.exports = {
  plugins: {
    // Tailwind CSS 由 weapp-tailwindcss 生成模式接管，这里不要再注册 tailwindcss
    // 假如框架已经内置了 `autoprefixer`，可以去除下一行
    autoprefixer: {},
  }
}
