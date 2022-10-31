// from @unocss/core/extractors/split.ts
// unocss 的思路是利用打包时，同时对code进行修改和对css进行生成
// 这点和 tailwindcss 不同，因为我们使用 tailwindcss 都是把它作为一个 postcss 插件
// 但是 postcss 是没有能力，去修改除了 css 以外的东西的
// 而 unocss 利用了打包工具，进行了一个状态的复用，
// 所以 unocss 在最新的测试里， 2022/10/25 速度大约比 tailwindcss 快 6 倍 (windicss 已死，有事可以鞭尸)
// 毕竟利用 postcss 生成 ast 进行修改，本来就会比纯打包要慢的
// 上面这堆屁话说完
// 这个既然是一个插件，为什么不能学习一下 unocss 呢?

export const validateFilterRE = /[\w\u00A0-\uFFFF-_:%-?]/

export function isValidSelector(selector = ''): selector is string {
  return validateFilterRE.test(selector)
}

export const splitCode = (code: string) => [...new Set(code.split(/\\?[\s'"`;={}]+/g))].filter(isValidSelector)
