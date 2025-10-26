const fs = require('node:fs')
const { createRequire } = require('node:module')
const path = require('node:path')
const postcss = require('postcss7')

const tailwindcssRequire = createRequire(require.resolve('tailwindcss/package.json', { paths: [__dirname] }))
const tailwindcss = tailwindcssRequire('tailwindcss')
const { TailwindcssPatcher } = require('tailwindcss-patch')
const { createContext } = require('weapp-tailwindcss/core')

function createTailwindCompatOptions() {
  const tailwindEntry = require.resolve('tailwindcss', { paths: [__dirname] })
  return {
    version: 2,
    packageName: 'tailwindcss',
    cwd: __dirname,
    postcssPlugin: tailwindEntry,
    v2: {
      cwd: __dirname,
      postcssPlugin: tailwindEntry,
    },
  }
}

const { transformWxss } = createContext(
  {
    rem2rpx: true,
    tailwindcssPatcherOptions: {
      cwd: __dirname,
      tailwind: createTailwindCompatOptions(),
    },
  },
)

async function main() {
  const twPatcher = new TailwindcssPatcher({
    tailwind: createTailwindCompatOptions(),
  })
  twPatcher.patch()

  const tw = tailwindcss({
    mode: 'jit',
    purge: {
      content: [{
        raw: 'w-[99px] h-[121px] !p-[1.1px] m-3',
      }],
    },
    corePlugins: {
      preflight: false,
    },
  })
  const result = await postcss([tw]).process(`@tailwind base;
  @tailwind components;
  @tailwind utilities;`, { from: undefined })
  fs.writeFileSync(path.join(__dirname, 'result.css'), result.css, 'utf8')
  fs.writeFileSync(path.join(__dirname, 'transformed.css'), (await transformWxss(result.css)).css, 'utf8')

  // const ctx = require('tailwindcss/lib/jit/index')
  // console.log(ctx)

  const ctx = await twPatcher.getClassSet()
  fs.writeFileSync(path.join(__dirname, 'result.json'), JSON.stringify(Array.from(ctx), null, 2), 'utf8')
}

main()
