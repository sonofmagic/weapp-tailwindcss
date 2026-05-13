const fs = require('node:fs/promises')
const path = require('node:path')
const { defu } = require('defu')
const tailwindcss = require('tailwindcss')
const tailwindcssV4Postcss = require('@tailwindcss/postcss')
const postcss = require('postcss')
const { createContext } = require('weapp-tailwindcss/core')

const demoClasses = [
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
  'dark:text-[14.54rpx]',
]

const jsClassNames = [
  'bg-[length:200rpx_100rpx]',
  'grid-cols-[200rpx_minmax(900rpx,_1fr)_100rpx]',
  'dark:text-[14.54rpx]',
]

function createTailwindV4Css(classes) {
  const inlineSource = classes.join(' ').replaceAll('\\', '\\\\').replaceAll('"', '\\"')
  return `@config "./tailwind.config.cjs";\n@import "tailwindcss4/utilities" source(none);\n@source inline("${inlineSource}");\n`
}

async function getCssV3(content, options) {
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

async function getCssV4(content) {
  const css = createTailwindV4Css(Array.isArray(content) ? content : [content])
  return postcss([
    tailwindcssV4Postcss({
      base: __dirname,
      optimize: false,
    }),
  ]).process(css, {
    from: 'index.v4.css',
    to: 'index.v4.css',
  })
}

async function runVersion(version) {
  const isV4 = version === 'v4'
  const { css } = isV4 ? await getCssV4(demoClasses) : await getCssV3(demoClasses)
  const demoDir = __dirname
  const tailwindConfigPath = path.join(demoDir, 'tailwind.config.cjs')
  const artifactDir = path.join(demoDir, 'artifacts', isV4 ? 'tailwindcss-v4' : 'tailwindcss-v3')
  const cssEntryPath = path.join(artifactDir, 'index.css')

  await fs.mkdir(artifactDir, { recursive: true })
  await fs.writeFile(cssEntryPath, css, 'utf8')

  const ctx = createContext({
    tailwindcssBasedir: demoDir,
    tailwindcss: {
      cwd: demoDir,
      config: tailwindConfigPath,
      packageName: isV4 ? 'tailwindcss4' : 'tailwindcss',
      version: isV4 ? 4 : 3,
      v4: isV4
        ? {
            cssSources: [
              {
                file: cssEntryPath,
                css,
              },
            ],
          }
        : undefined,
    },
  })

  const wxml = await ctx.transformWxml('<view class="shadow-[0_35rpx_60rx_-15px_rgba(0,0,0,0.3)]" wx:if="{{ xxx.length > 0 }}">')
  await fs.writeFile(path.join(artifactDir, 'out.html'), wxml, 'utf8')
  const { css: cssOut } = await ctx.transformWxss(css)
  await fs.writeFile(path.join(artifactDir, 'out.css'), cssOut, 'utf8')
  const content = `const classNames = ${JSON.stringify(jsClassNames)}`
  const { code } = await ctx.transformJs(content)
  await fs.writeFile(path.join(artifactDir, 'out.js'), code, 'utf8')

  if (!isV4) {
    await fs.writeFile('./index.css', css, 'utf8')
    await fs.writeFile('./out.html', wxml, 'utf8')
    await fs.writeFile('./out.css', cssOut, 'utf8')
    await fs.writeFile('./out.js', code, 'utf8')
  }
}

async function main() {
  const target = process.argv[2] ?? 'all'
  if (target === 'v3' || target === 'all') {
    await runVersion('v3')
  }
  if (target === 'v4' || target === 'all') {
    await runVersion('v4')
  }
}

main()
