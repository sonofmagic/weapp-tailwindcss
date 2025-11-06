// 参考：https://uniapp.dcloud.net.cn/tutorial/platform.html#%E6%A0%B7%E5%BC%8F%E7%9A%84%E6%9D%A1%E4%BB%B6%E7%BC%96%E8%AF%91
// %PLATFORM% 条件编译占位符
export const uniAppPlatform = [
  // 一般不会用到的枚举项
  'VUE3',
  'UNI-APP-X',
  'uniVersion',
  'APP',
  'APP-PLUS',
  'APP-PLUS-NVUE',
  'APP-NVUE',
  'APP-ANDROID',
  'APP-IOS',
  'H5',
  'WEB',
  'MP-WEIXIN',
  'MP-ALIPAY',
  'MP-BAIDU',
  'MP-TOUTIAO',
  'MP-LARK',
  'MP-QQ',
  'MP-KUAISHOU',
  'MP-JD',
  'MP-360',
  'MP',
  'QUICKAPP-WEBVIEW',
  'QUICKAPP-WEBVIEW-UNION',
  'QUICKAPP-WEBVIEW-HUAWEI',
]

// 预留：staticVariants 配置占位
export const queryKey = 'weapp-tw-platform'

export function createMediaQuery(value: string) {
  return `@media (${queryKey}:"${value}"){&}`
}

export function createNegativeMediaQuery(value: string) {
  return `@media not screen and (${queryKey}:"${value}"){&}`
}

export function normalComment(text: string) {
  if (typeof text === 'string') {
    return text.replaceAll(/(?<!\\)_/g, ' ')
  }
  return text
}

export function ifdef(text: string) {
  return {
    start: `#ifdef ${normalComment(text)}`,
    end: `#endif`,
  }
}

export function ifndef(text: string) {
  return {
    start: `#ifndef ${normalComment(text)}`,
    end: `#endif`,
  }
}
// 示例：
// uniVersion > 3.9
// H5 || MP-WEIXIN
// not screen and (weapp-tw-platform:MP-WEIXIN)
export function matchCustomPropertyFromValue(str: string, cb: (arr: RegExpExecArray, index: number) => void) {
  let arr: RegExpExecArray | null
  let index = 0

  const regex = new RegExp(`\\(\\s*${queryKey}\\s*:\\s*"([^)]*)"\\)`, 'g')
  // eslint-disable-next-line no-cond-assign
  while ((arr = regex.exec(str)) !== null) {
    cb(arr, index)
    index++
  }
}
