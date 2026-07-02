import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  css: [
    '~/assets/css/tailwind.css',
  ],
  vite: {
    plugins: [
      ...(
        WeappTailwindcss({
          tailwindcssBasedir: projectRoot,
          cssEntries: [
            resolve(projectRoot, 'app/assets/css/tailwind.css'),
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
  },
})
