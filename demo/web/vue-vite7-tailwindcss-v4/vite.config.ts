import vue from '@vitejs/plugin-vue'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    ...(
      WeappTailwindcss({
        tailwindcssBasedir: projectRoot,
        cssEntries: [
          resolve(projectRoot, 'src/tailwind.css'),
        ],
        generator: {
          target: 'web',
          webCompat: {
            preset: 'legacy-web',
          },
        },
      }) ?? []
    ),
  ],
})
