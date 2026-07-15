export { WebpackFrameworkPlugin } from './create-framework-plugin/plugin'
export type { WebpackFrameworkBranchContext } from './create-framework-plugin/plugin'
export { weappTailwindcssPackageDir } from './create-framework-plugin/watch-output'

// setupWebpackWatchOutputIgnore 使用 compiler.outputPath || compiler.options?.output?.path 过滤 watch 输出。
