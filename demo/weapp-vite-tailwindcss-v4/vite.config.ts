import { resolve } from 'node:path'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'

const weappTailwindcssPlugins = WeappTailwindcss({
  tailwindcssBasedir: process.cwd(),
  cssEntries: [resolve(process.cwd(), 'tailwind.css')],
  cssSourceTrace: true,
  rem2rpx: true,
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
