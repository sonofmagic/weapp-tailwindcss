import tailwindcss from '@tailwindcss/postcss'
import fs from 'fs-extra'
import path from 'pathe'
import postcss from 'postcss'

async function main() {
  const { css } = await postcss(
    [
      tailwindcss({

      }),
    ],
  )
    .process(
      // @ts-ignore
      '@import "tailwindcss";',
      {
        from: './index.ts',
      },
    )

  await fs.outputFile(path.resolve(import.meta.dirname, '../../../packages/weapp-tailwindcss/test/fixtures/css/v4-default.css'), css, 'utf8')
}

main()
