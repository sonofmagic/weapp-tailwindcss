import type { Context } from './context'
import fs from 'fs-extra'
import path from 'pathe'

async function getRows(ctx: Context) {
  const { projects, git, cwd } = ctx
  const gitUrl = await git.getGitUrl()
  const gitUser = await git.getUser()
  const rows: string[] = []
  if (gitUrl) {
    rows.push(`# ${gitUrl.name}\n`)
  }
  rows.push('## Projects\n')
  for (const project of projects) {
    const p = path.relative(cwd, project.rootDirRealPath)
    p && rows.push(`- [${project.manifest.name}](${p}) ${project.manifest.description ? `- ${project.manifest.description}` : ''}`)
  }
  // ## Documentation
  // ## Communication
  if (gitUrl) {
    // ## Contributing
    rows.push('\n## Contributing\n')
    rows.push('Contributions Welcome! You can contribute in the following ways.')
    rows.push('')
    rows.push('- Create an Issue - Propose a new feature. Report a bug.')
    rows.push('- Pull Request - Fix a bug and typo. Refactor the code.')
    rows.push('- Create third-party middleware - Instruct below.')
    rows.push('- Share - Share your thoughts on the Blog, X, and others.')
    rows.push(`- Make your application - Please try to use ${gitUrl.name}.`)
    rows.push('')
    rows.push('For more details, see [CONTRIBUTING.md](CONTRIBUTING.md).')
    // ## Contributors
    rows.push('\n## Contributors\n')
    rows.push(`Thanks to [all contributors](https://github.com/${gitUrl.full_name}/graphs/contributors)!`)
  }

  // ## Authors

  rows.push('\n## Authors\n')
  rows.push(`${gitUser.name} <${gitUser.email}>`)

  // ## License

  rows.push('\n## License\n')
  rows.push('Distributed under the MIT License. See [LICENSE](LICENSE) for more information.')

  return rows
}

export default async function (ctx: Context) {
  const rows = await getRows(ctx)
  await fs.writeFile(path.resolve(ctx.cwd, 'README.md'), `${rows.join('\n')}\n`)
}
