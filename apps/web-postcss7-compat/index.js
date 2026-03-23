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
    resolve: {
      paths: [path.join(__dirname, 'node_modules')],
    },
    postcssPlugin: tailwindEntry,
    v2: {
      postcssPlugin: tailwindEntry,
    },
  }
}

const { transformWxss } = createContext(
  {
    tailwindcssBasedir: __dirname,
    rem2rpx: true,
    tailwindcssPatcherOptions: {
      projectRoot: __dirname,
      tailwindcss: createTailwindCompatOptions(),
    },
  },
)

async function main() {
  const twPatcher = new TailwindcssPatcher({
    projectRoot: __dirname,
    tailwindcss: createTailwindCompatOptions(),
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
  fs.writeFileSync(path.join(__dirname, 'result.json'), JSON.stringify([...ctx], null, 2), 'utf8')
}

main()
