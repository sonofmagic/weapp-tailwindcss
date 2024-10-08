const fs = require('node:fs/promises')
const { defu } = require('defu')
const tailwindcss = require('tailwindcss')
const postcss = require('postcss')
const { createContext } = require('weapp-tailwindcss/core')

async function getCss(content, options) {
  const { css, postcssPlugins, twConfig } = defu(options, {
    css: '@tailwind utilities;',
    postcssPlugins: [],
    /**
     * @type {import('tailwindcss').Config}
     */
    twConfig: {
      darkMode: 'class'
    }
  })
  if (typeof content === 'string') {
    content = [content]
  }
  const processor = postcss([
    tailwindcss({
      content: content.map((x) => {
        return {
          raw: x
        }
      }),
      ...twConfig
    }),
    ...postcssPlugins
  ])
  const res = await processor.process(css, {
    from: 'index.css',
    to: 'index.css'
  })
  return res
}

async function main() {
  const { css } = await getCss([
    // flexbox and grid
    'basis-[32rpx]',
    'grid-cols-[200rpx_minmax(900rpx,_1fr)_100rpx]',
    'gap-[2.75rpx]',
    // spacing
    'p-[0.32rpx]',
    'm-[23.43rpx]',
    'space-y-[12.0rpx]',
    // sizing
    'w-[12rpx]',
    'min-w-[12rpx]',
    'max-w-[12rpx]',
    'h-[12rpx]',
    'min-h-[12rpx]',
    'max-h-[12rpx]',
    // Typography
    'text-[32rpx]',
    'text-[#fafafa]',
    'text-[length:32rpx]',
    'text-[color:32rpx]',
    'tracking-[.25rpx]',
    'leading-[3rpx]',
    'decoration-[3rpx]',
    'underline-offset-[3rpx]',
    'indent-[50rpx]',
    // Backgrounds
    'bg-[center_top_1rpx]',
    'bg-[length:200rpx_100rpx]',
    // Borders
    'rounded-[12rpx]',
    'border-t-[3rpx]',
    'divide-x-[3rpx]',
    'outline-[5rpx]',
    'ring-[10rpx]',
    'ring-offset-[3rpx]',
    // Effects
    'shadow-[0_35rpx_60rx_-15px_rgba(0,0,0,0.3)]',
    // Transforms
    'translate-y-[17rpx]',
    'dark:text-[14.54rpx]'
  ])
  await fs.writeFile('./index.css', css, 'utf8')
  const ctx = createContext()
  const wxml = await ctx.transformWxml('<view class="shadow-[0_35rpx_60rx_-15px_rgba(0,0,0,0.3)]" wx:if="{{ xxx.length > 0 }}">')
  await fs.writeFile('./out.html', wxml, 'utf8')
  const { css: cssOut } = await ctx.transformWxss(css)
  await fs.writeFile('./out.css', cssOut, 'utf8')
  const content = `const classNames = ['bg-[length:200rpx_100rpx]']`
  const { code } = await ctx.transformJs(content)
  await fs.writeFile('./out.js', code, 'utf8')
}

main()
