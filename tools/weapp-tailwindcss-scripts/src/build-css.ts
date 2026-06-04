// import browserslist from 'browserslist'
import fs from 'fs-extra'
import { bundleAsync } from 'lightningcss'
import { resolveCorePackagePath } from './paths'
// Features
// const targets = browserslistToTargets(browserslist('>= 0.25%'))
async function main() {
  const files = ['index.css', 'preflight.css', 'theme.css', 'utilities.css', 'with-layer.css', 'uni-app-x.css']

  await Promise.all(
    files.map(async (x) => {
      const { code } = await bundleAsync(
        {
          filename: resolveCorePackagePath('css', x),
          minify: true,
          projectRoot: resolveCorePackagePath(),
        },
      )
      await fs.outputFile(resolveCorePackagePath(x), code, 'utf8')
    }),
  )
}

main()
