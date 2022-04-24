export function replaceWxml (original: string, keepEOL: boolean = false) {
  const res = original
    .replace(/\[/g, '_l_') // [
    .replace(/\]/g, '_r_') // ]
    .replace(/\(/g, '_p_') // (
    .replace(/\)/g, '_q_') // )
    .replace(/#/g, '_h_') // hex
    .replace(/!/g, '_i_') // css !important
    .replace(/\//g, '-div-') // /
    .replace(/\./g, '-dot-') // .
    // :
    .replace(/:/g, '_c_')
    // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/8
    .replace(/%/g, '_pct_')
  if (keepEOL) {
    return res
  }
  return (
    res
      // 去除无用换行符和空格
      .replace(/[\r\n]+/g, '')
  )
}
