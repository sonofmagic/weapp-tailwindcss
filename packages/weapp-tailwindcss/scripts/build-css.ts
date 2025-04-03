import fs from 'fs-extra'
import { bundleAsync } from 'lightningcss'
import path from 'pathe'

async function main() {
  const targets = ['index.css', 'preflight.css', 'theme.css', 'utilities.css', 'with-layer.css']

  await Promise.all(
    targets.map(async (x) => {
      const { code } = await bundleAsync(
        {
          filename: `css/${x}`,
          minify: false,

          // resolver: {
          //   read(filePath) {
          //     return fs.readFileSync(filePath, 'utf8')
          //   },
          //   resolve(specifier, from) {
          //     return path.resolve(path.dirname(from), specifier)
          //   },
          // },
        },
      )
      await fs.outputFile(path.resolve(__dirname, `../${x}`), code, 'utf8')
    }),
  )
}

main()
