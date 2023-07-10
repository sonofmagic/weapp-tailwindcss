import fs from 'node:fs'
import path from 'node:path'
import postcss, { Declaration, Rule } from 'postcss'

function main() {
  const rawSource = path.resolve(__dirname, '../test/fixtures/css/css-var-scope-raw.css')
  const target = path.resolve(__dirname, '../src/postcss/cssVars.ts')
  const content = fs.readFileSync(rawSource, 'utf8')

  const root = postcss.parse(content)
  const rule = root.nodes[0] as Rule

  const decls = (rule.nodes as Declaration[]).map((x) => {
    return {
      prop: x.prop,
      value: x.value
    }
  })

  fs.writeFileSync(target, `export default ${JSON.stringify(decls, null, 2)}`)
}

main()
