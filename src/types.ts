export interface UserDefinedOptions {
  /**
   * wxml/ttml 这类的 ml 的匹配方法
   */
  htmlMatcher?: (name: string) => boolean
  /**
   * wxss/jxss/ttss 这类的 ss 的匹配方法
   */
  cssMatcher?: (name: string) => boolean
  /**
   * 用于处理js
   */
  jsMatcher?: (name: string) => boolean
  /**
   * tailwind jit main chunk 的匹配方法
   * 用于处理原始变量和替换不兼容选择器
   */
  mainCssChunkMatcher?: (name: string, appType?: 'uni-app' | 'taro') => boolean
}

export interface TaroUserDefinedOptions extends UserDefinedOptions {
  framework: 'react' | 'vue' | 'vue3' | string
}

export interface StyleHandlerOptions {
  isMainChunk?: boolean
}
