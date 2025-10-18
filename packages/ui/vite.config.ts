import type { UserConfig } from 'vite'
import Tailwindcss from '@tailwindcss/vite'
import Vue from '@vitejs/plugin-vue'
import path from 'pathe'
import VueRouter from 'unplugin-vue-router/vite'
import { mergeConfig } from 'vite'
import DTS from 'vite-plugin-dts'
import { sharedConfig } from './vite.shared.config'

export default mergeConfig(sharedConfig, {
  plugins: [
    VueRouter(
      {
        dts: path.relative(import.meta.dirname, './types/typed-router.d.ts'),
      },
    ),
    Vue(),
    DTS(
      {
        tsconfigPath: './tsconfig.app.json',
        entryRoot: './lib',
      },
    ),
    Tailwindcss(),
  ],
  // https://vite.dev/guide/build.html#library-mode
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, 'lib/index'),
      name: 'icebreaker',
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
} satisfies UserConfig)
