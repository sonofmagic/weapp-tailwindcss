const fs = require('node:fs')
const path = require('node:path')
const postcss = require('postcss7')
const tailwindcss = require('tailwindcss')
const { TailwindcssPatcher } = require('tailwindcss-patch')
const { createContext } = require('weapp-tailwindcss/core')

const { transformWxss } = createContext(
  {
    rem2rpx: true,
  },
)

async function main() {
  const twPatcher = new TailwindcssPatcher({
    patch: {
      resolve: {
        paths: [
          __filename,
          // import.meta.url
        ],
      },
    },
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
  const result = postcss([tw]).process(`@tailwind base;
  @tailwind components;
  @tailwind utilities;`)
  // console.log(result.css)
  fs.writeFileSync(path.join(__dirname, 'result.css'), result.css, 'utf8')
  fs.writeFileSync(path.join(__dirname, 'transformed.css'), (await transformWxss(result.css)).css, 'utf8')

  // const ctx = require('tailwindcss/lib/jit/index')
  // console.log(ctx)

  const ctx = await twPatcher.getClassSet()
  fs.writeFileSync(path.join(__dirname, 'result.json'), JSON.stringify(Array.from(ctx), null, 2), 'utf8')
}

main()
