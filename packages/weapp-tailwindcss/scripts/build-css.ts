// import browserslist from 'browserslist'
import fs from 'fs-extra'
import { bundleAsync } from 'lightningcss'
import path from 'pathe'
// Features
// const targets = browserslistToTargets(browserslist('>= 0.25%'))
async function main() {
  const files = ['index.css', 'preflight.css', 'theme.css', 'utilities.css', 'with-layer.css']

  await Promise.all(
    files.map(async (x) => {
      const { code } = await bundleAsync(
        {
          filename: `css/${x}`,
          minify: true,
          projectRoot: path.resolve(__dirname, '../'),
        },
      )
      await fs.outputFile(path.resolve(__dirname, `../${x}`), code, 'utf8')
    }),
  )
}

main()
