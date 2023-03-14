import path from 'path'
import t from '@babel/types'
import { parse, traverse, generate } from '@/babel'
export function getContexts() {
  const injectFilePath = path.join(process.cwd(), 'node_modules', 'tailwindcss/lib/index.js')
  const p = require.resolve(injectFilePath)
  const mo = require(p)
  return (mo.contextRef.value as any[]).map(x => x.classCache)
  // processTailwindFeatures return content
}

export function inspectProcessTailwindFeaturesReturnContext(content: string) {
  const ast = parse(content)
  let start = false
  traverse(ast, {
    FunctionDeclaration(p) {
      const n = p.node
      if (n.id?.name === 'processTailwindFeatures') {
        start = true
      }
    },
    BlockStatement(p) {
      const n = p.node
      if (start && p.parent.type === 'FunctionExpression') {
        const rts = t.returnStatement()
        rts.argument = t.identifier('context')
        n.body.push(rts)
      }
    },
  })
  return generate(ast)
}