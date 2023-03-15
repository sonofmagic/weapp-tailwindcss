import * as t from '@babel/types'
import { parse, traverse, generate } from '@/babel'
// crash code 垃圾代码

export function inspectProcessTailwindFeaturesReturnContext(content: string) {
  const ast = parse(content)
  let hasPatched = false
  traverse(ast, {
    FunctionDeclaration(p) {
      const n = p.node
      if (n.id?.name === 'processTailwindFeatures') {
        if (n.body.body.length === 1 && n.body.body[0].type === 'ReturnStatement') {
          const rts = n.body.body[0]
          if (rts.argument?.type === 'FunctionExpression') {
            const body = rts.argument.body.body
            const lastStatement = body[body.length - 1]
            hasPatched = lastStatement.type === 'ReturnStatement' && lastStatement.argument?.type === 'Identifier' && lastStatement.argument.name === 'context'
            if (!hasPatched) {
              // return context;
              const rts = t.returnStatement(t.identifier('context'))
              body.push(rts)
            }
          }
        }
      }
    }
  })

  return {
    code: hasPatched ? content : generate(ast).code,
    hasPatched
  }
}

export function inspectPostcssPlugin(content: string) {
  const ast = parse(content)
  const exportKey = 'contextRef'
  const variableName = 'contextRef'
  const valueKey = 'value'
  let hasPatched = false
  traverse(ast, {
    Program(p) {
      const n = p.node
      const idx = n.body.findIndex((x) => {
        return (
          x.type === 'ExpressionStatement' &&
          x.expression.type === 'AssignmentExpression' &&
          x.expression.left.type === 'MemberExpression' &&
          x.expression.right.type === 'FunctionExpression' &&
          x.expression.right.id?.name === 'tailwindcss'
        )
      })
      if (idx > -1) {
        const prevStatement = n.body[idx - 1]
        const lastStatement = n.body[n.body.length - 1]
        const hasPatchedCondition0 =
          prevStatement &&
          prevStatement.type === 'VariableDeclaration' &&
          prevStatement.declarations.length === 1 &&
          prevStatement.declarations[0].id.type === 'Identifier' &&
          prevStatement.declarations[0].id.name === variableName
        const hasPatchedCondition1 =
          lastStatement.type === 'ExpressionStatement' &&
          lastStatement.expression.type === 'AssignmentExpression' &&
          lastStatement.expression.right.type === 'Identifier' &&
          lastStatement.expression.right.name === variableName

        hasPatched = hasPatchedCondition0 || hasPatchedCondition1
        if (!hasPatched) {
          // const contextRef = {
          //   value: []
          // };
          const statement = t.variableDeclaration('const', [
            t.variableDeclarator(t.identifier(variableName), t.objectExpression([t.objectProperty(t.identifier(valueKey), t.arrayExpression())]))
          ])
          n.body.splice(idx, 0, statement)
          // module.exports.contextRef = contextRef;
          n.body.push(
            t.expressionStatement(
              t.assignmentExpression(
                '=',
                t.memberExpression(t.memberExpression(t.identifier('module'), t.identifier('exports')), t.identifier(exportKey)),
                t.identifier(variableName)
              )
            )
          )
        }
      }
    },
    FunctionExpression(p) {
      if (hasPatched) {
        return
      }
      const n = p.node
      if (n.id?.name === 'tailwindcss') {
        if (n.body.body.length === 1 && n.body.body[0].type === 'ReturnStatement') {
          const returnStatement = n.body.body[0]
          if (returnStatement.argument?.type === 'ObjectExpression' && returnStatement.argument.properties.length === 2) {
            const properties = returnStatement.argument.properties
            if (properties[0].type === 'ObjectProperty' && properties[1].type === 'ObjectProperty') {
              const keyMatched = properties[0].key.type === 'Identifier' && properties[0].key.name === 'postcssPlugin'
              const pluginsMatched = properties[1].key.type === 'Identifier' && properties[1].key.name === 'plugins'
              if (
                pluginsMatched &&
                keyMatched &&
                properties[1].value.type === 'CallExpression' &&
                properties[1].value.callee.type === 'MemberExpression' &&
                properties[1].value.callee.object.type === 'ArrayExpression'
              ) {
                const pluginsCode = properties[1].value.callee.object.elements
                if (pluginsCode[1] && pluginsCode[1].type === 'FunctionExpression') {
                  const targetBlockStatement = pluginsCode[1].body

                  const lastStatement = targetBlockStatement.body[targetBlockStatement.body.length - 1]
                  if (lastStatement.type === 'ExpressionStatement') {
                    // contextRef.value.push((0, _processTailwindFeatures.default)(context)(root, result));
                    const newExpressionStatement = t.expressionStatement(
                      t.callExpression(
                        t.memberExpression(
                          t.memberExpression(t.identifier(variableName), t.identifier('value')),

                          t.identifier('push')
                        ),

                        [lastStatement.expression]
                      )
                    )
                    targetBlockStatement.body[targetBlockStatement.body.length - 1] = newExpressionStatement
                  }

                  const ifIdx = targetBlockStatement.body.findIndex((x) => x.type === 'IfStatement')
                  if (ifIdx > -1) {
                    const ifRoot = <t.IfStatement>targetBlockStatement.body[ifIdx]
                    if (ifRoot.consequent.type === 'BlockStatement' && ifRoot.consequent.body[1] && ifRoot.consequent.body[1].type === 'ForOfStatement') {
                      const forOf: t.ForOfStatement = ifRoot.consequent.body[1]
                      if (forOf.body.type === 'BlockStatement' && forOf.body.body.length === 1 && forOf.body.body[0].type === 'IfStatement') {
                        const if2: t.IfStatement = forOf.body.body[0]
                        if (if2.consequent.type === 'BlockStatement' && if2.consequent.body.length === 1 && if2.consequent.body[0].type === 'ExpressionStatement') {
                          const target = if2.consequent.body[0]
                          // contextRef.value.push((0, _processTailwindFeatures.default)(context)(root1, result));
                          const newExpressionStatement = t.expressionStatement(
                            t.callExpression(t.memberExpression(t.memberExpression(t.identifier(variableName), t.identifier('value')), t.identifier('push')), [target.expression])
                          )
                          if2.consequent.body[0] = newExpressionStatement
                        }
                      }
                    }
                  }
                  // clear contextRef.value
                  targetBlockStatement.body.unshift(
                    // contentRef.value = []
                    // t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.identifier(variableName), t.identifier(valueKey)), t.arrayExpression()))

                    // contentRef.value.length = 0
                    t.expressionStatement(
                      t.assignmentExpression(
                        '=',
                        t.memberExpression(t.memberExpression(t.identifier(variableName), t.identifier(valueKey)), t.identifier('length')),
                        t.numericLiteral(0)
                      )
                    )
                  )
                }
              }
            }
          }
        }
        // start = true
      }
    }
    // BlockStatement(p) {
    //   const n = p.node
    //   if (start && p.parent.type === 'FunctionExpression' && !p.parent.id) {
    //     n.body.unshift(t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.identifier(variableName), t.identifier(valueKey)), t.arrayExpression())))
    //   }
    // }
  })
  return {
    code: hasPatched ? content : generate(ast).code,
    hasPatched
  }
}
