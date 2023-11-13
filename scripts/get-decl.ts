import fs from 'node:fs'
import path from 'node:path'
import postcss, { Declaration, Rule } from 'postcss'
import tailwindcss from 'tailwindcss'
async function main() {
  // @ts-ignore
  const source = await postcss([
    tailwindcss({
      content: {
        files: [
          {
            raw: ''
          }
        ]
      },
      corePlugins: {
        preflight: false
      }
    })
  ]).process(`@tailwind base;
  @tailwind components;
  @tailwind utilities;`)
  fs.writeFileSync(path.resolve(__dirname, 'var.css'), source.css, 'utf8')

  // const rawSource = path.resolve(__dirname, '../test/fixtures/css/css-var-scope-raw.css')
  const target = path.resolve(__dirname, '../src/postcss/cssVars.ts')
  const content = source.css // fs.readFileSync(rawSource, 'utf8')

  const root = postcss.parse(content)
  const rule = root.nodes[0] as Rule

  const decls = (rule.nodes as Declaration[]).map((x) => {
    const v = x.value.trim()
    const value = v === '' ? ' ' : v
    return {
      prop: x.prop,
      value
    }
  })

  fs.writeFileSync(target, `export default ${JSON.stringify(decls, null, 2)}`)
}

main()
