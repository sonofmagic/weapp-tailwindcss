const fs = require('node:fs')
const path = require('node:path')
const postcss = require('postcss7')
const tailwindcss = require('tailwindcss')
const { TailwindcssPatcher } = require('tailwindcss-patch')

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
        raw: 'w-[99px] h-[121px] !p-[1.1px]',
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

  // const ctx = require('tailwindcss/lib/jit/index')
  // console.log(ctx)

  const ctx = await twPatcher.getClassSet()
  fs.writeFileSync(path.join(__dirname, 'result.json'), JSON.stringify(Array.from(ctx), null, 2), 'utf8')
}

main()
