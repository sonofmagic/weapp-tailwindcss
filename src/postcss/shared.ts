// .sm\\:text-3xl
// css 中，要多加一个 '\' 来转义
export function cssSelectorReplacer (selector: string) {
  return (
    selector
      .replace(/\\\[/g, '_l_') // \[
      .replace(/\\\]/g, '_r_') // \]
      .replace(/\\\(/g, '_p_') // \(
      .replace(/\\\)/g, '_q_') // \)
      .replace(/\\#/g, '_h_') // \# : hex
      .replace(/\\!/g, '_i_') // \! : !important
      .replace(/\\\//g, '_div_') // \/ : w-1/2 -> width:50%
      .replace(/\\\./g, '_dot_') // \. : w-1.5
      // \\:
      .replace(/\\:/g, '_c_') // colon for screen
      // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/8
      .replace(/\\%/g, '_pct_')
  )
}
