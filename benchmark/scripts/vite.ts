import path from 'pathe'
import { build } from 'vite'

async function main() {
  await build({
    build: {
      rollupOptions: {
        input: [
          path.resolve(import.meta.dirname, './index.css'),
        ],
      },
      outDir: './scripts/dist',
    },
  })
}

main()
