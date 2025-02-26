import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import fs from 'fs-extra'
import path from 'pathe'

async function exportRoutes() {
  const code = await fs.readFile(
    path.resolve(
      __dirname,
      '../.docusaurus/routes.js',
    ),
    {
      encoding: 'utf8',
    },
  )
  const ast = parse(code, {
    sourceType: 'unambiguous',
  })

  const set = new Set()

  traverse(ast, {
    ObjectExpression: {
      exit(p) {
        const propertiesPath = p.get('properties')
        const property = propertiesPath.find((x) => {
          return x.isObjectProperty() && x.get('key').isIdentifier({ name: 'exact' }) && x.get('value').isBooleanLiteral({ value: true })
        })
        if (property) {
          propertiesPath.find((x) => {
            if (x.isObjectProperty()) {
              const valuePath = x.get('value')
              const flag = x.get('key').isIdentifier({ name: 'path' }) && valuePath.isStringLiteral()
              if (flag) {
                set.add(valuePath.node.value)
              }
              return flag
            }
            return false
          })
        }
      },
    },
  })
  // console.log(set)
  await fs.outputJSON(
    path.resolve(__dirname, '../routes.json'),
    [...set],
    {
      spaces: 2,
    },
  )
  // console.log('Routes exported to routes.json')
}

exportRoutes()
