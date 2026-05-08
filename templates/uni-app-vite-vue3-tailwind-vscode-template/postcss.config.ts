import type { AcceptedPlugin } from 'postcss'
import autoprefixer from 'autoprefixer'
import cssMacro from 'weapp-tailwindcss/css-macro/postcss'

// Tailwind CSS 由 weapp-tailwindcss 生成模式接管，这里不要再注册 tailwindcss
const plugins: AcceptedPlugin[] = [autoprefixer()]

// 可以使用 postcss-pxtransform 来进行 px 转 rpx 的功能
// 详见: https://tw.icebreaker.top/docs/quick-start/css-unit-transform#px-%E8%BD%AC-rpx

plugins.push(cssMacro)

export default plugins
