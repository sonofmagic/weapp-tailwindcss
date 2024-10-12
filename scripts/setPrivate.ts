import process from 'node:process'
import { getWorkspacePackages } from '@icebreakers/monorepo'

const cwd = process.cwd()
const pkgs = await getWorkspacePackages(cwd)

for (const pkg of pkgs) {
  if (!pkg.manifest.name || !['weapp-tailwindcss', 'tailwindcss-core-plugins-extractor', '@weapp-tailwindcss/cli', '@weapp-tailwindcss/typography'].includes(pkg.manifest.name)) {
    // console.log(pkg.manifest.name)
    pkg.manifest.private = true
    await pkg.writeProjectManifest(pkg.manifest)
  }
}
