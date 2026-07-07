import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'

const require = createRequire(import.meta.url)
const projectRoot = dirname(fileURLToPath(import.meta.url))
const parity = require('../official-postcss-parity-plugin.cjs')
const officialPostcssParity = process.env.WEAPP_TW_OFFICIAL_POSTCSS_PARITY === '1'
const weappTailwindcssPlugins = WeappTailwindcss({
  tailwindcssBasedir: projectRoot,
  cssEntries: [
    resolve(projectRoot, 'tailwind.css'),
    resolve(projectRoot, 'sub-normal/pages/index.css'),
    resolve(projectRoot, 'sub-independent/pages/index.css'),
  ],
  cssSourceTrace: true,
  rem2rpx: true,
  generator: officialPostcssParity ? false : undefined,
  postcssOptions: parity.createOfficialPostcssParityPostcssOptions(),
}) ?? []

export default defineConfig({
  // root: './packageA',
  // build: {
  //   outDir: 'dist/packageA',
  // },
  // weapp: {
  //   srcRoot: 'packageA',
  //   subPackage: {

  //   },
  //   // srcRoot: 'src',
  // },
  plugins: [
    // tailwindcss(),
    ...weappTailwindcssPlugins,
  ],
  weapp: {
    forwardConsole: false,
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
  // build: {
  //   rollupOptions: {
  //     external: ['lodash'],
  //   },
  // },
})
