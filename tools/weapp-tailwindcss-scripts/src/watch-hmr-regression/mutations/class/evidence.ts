import ts from 'typescript'
import { createCssClassSignatureReader } from '../../../../../../packages/postcss/src/selectorParser/class-signatures'

type OutputTarget = 'wxml' | 'js'

export interface ClassOutputSnapshot {
  wxml: string
  js: string
  globalStyle: string
}

export interface ClassOutputEvidence {
  utility: string
  escapedClass: string
  actualClass: string
  target: OutputTarget
  ruleSignatures: string[]
}

function decodeHtml(value: string) {
  return value.replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')
}

function collectOutputTokenGroups(output: string, target: OutputTarget) {
  const values: string[] = []
  if (target === 'wxml') {
    const markup = output.replace(/<!--[\s\S]*?-->/g, '')
    for (const tag of markup.matchAll(/<[a-z][^"'<>]*(?:(?:"[^"]*"|'[^']*')[^"'<>]*)*>/gi)) {
      for (const attribute of tag[0].matchAll(/\s([^\s=<>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
        if (attribute[1] === 'class') {
          values.push(decodeHtml(attribute[2] ?? attribute[3] ?? ''))
        }
      }
    }
  }
  else {
    const source = ts.createSourceFile('output.js', output, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS)
    const visit = (node: ts.Node) => {
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        values.push(node.text)
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  return values.map(value => new Set(value.split(/\s+/).filter(Boolean)))
}

function collectOutputTokens(output: string, target: OutputTarget) {
  return new Set(collectOutputTokenGroups(output, target).flatMap(group => [...group]))
}

/** 检查模板 class 或 JS 字符串候选的完整 token，以及 safe class 与 utility 的完整规则。 */
export function assertClassTokensInOutput(
  outputs: ClassOutputSnapshot,
  classTokens: string[],
  escapedClasses: string[],
  targets: OutputTarget[],
  label: string,
  requireAll = true,
  requireCss = true,
): ClassOutputEvidence[] {
  if (targets.length === 0) {
    return []
  }
  const readSignatures = createCssClassSignatureReader(outputs.globalStyle)
  const evidence: ClassOutputEvidence[] = []
  for (const target of targets) {
    const groups = collectOutputTokenGroups(outputs[target], target)
    const tokens = new Set(groups.flatMap(group => [...group]))
    // 脚本候选的 scope 可来自同一产物的动态 class 属性；运行时绑定另由 IDE 门禁验证。
    const dynamicTemplateScopes = target === 'js'
      ? collectOutputTokenGroups(outputs.wxml, 'wxml').filter(group => [...group].some(token => token.includes('{{'))).flatMap(group => [...group])
      : []
    const safeClasses = [...tokens].filter(token => /^wtu-[\da-z]+-[\da-z]+$/i.test(token))
    let matched = 0
    for (const [index, utility] of classTokens.entries()) {
      const escapedClass = escapedClasses[index] ?? utility
      const escapedReference = readSignatures(escapedClass)
      const reference = escapedReference.length > 0 ? escapedReference : readSignatures(utility)
      const original = [escapedClass, utility].find(token => tokens.has(token))
      const actualClasses = safeClasses.filter((safeClass) => {
        return groups.filter(group => group.has(safeClass)).some((group) => {
          const scopes = new Set([...group, ...dynamicTemplateScopes].filter(token => /^data-v-[\da-z]+$/i.test(token)))
          const actual = readSignatures(safeClass, scopes)
          return reference.length > 0 && JSON.stringify(actual) === JSON.stringify(reference)
        })
      })
      if (original && (!requireCss || reference.length > 0)) {
        actualClasses.unshift(original)
      }
      if (actualClasses.length === 0) {
        if (requireAll) {
          throw new Error(`${label} ${target}: missing class/CSS evidence for ${utility} (${escapedClass}); consumed safe classes=${safeClasses.join(', ') || 'none'}`)
        }
        continue
      }
      matched += 1
      evidence.push(...actualClasses.map(actualClass => ({ utility, escapedClass, actualClass, target, ruleSignatures: reference })))
    }
    if (!requireAll && matched === 0) {
      throw new Error(`${label} ${target}: expected at least one class/CSS evidence for ${classTokens.join(', ')}`)
    }
  }
  return evidence
}

/** 回滚使用上一阶段已确认的实际类名；不能依赖回滚后可能已删除的 CSS 反推。 */
export function assertPreviousClassEvidenceRemoved(
  outputs: ClassOutputSnapshot,
  previous: ClassOutputEvidence[],
  retainedUtilities: string[],
  label: string,
  baseline?: ClassOutputSnapshot,
) {
  for (const entry of previous) {
    if (retainedUtilities.includes(entry.utility)) {
      continue
    }
    const tokens = collectOutputTokens(outputs[entry.target], entry.target)
    const baselineTokens = baseline ? collectOutputTokens(baseline[entry.target], entry.target) : new Set<string>()
    for (const token of new Set([entry.actualClass, entry.escapedClass, entry.utility])) {
      if (tokens.has(token) && !baselineTokens.has(token)) {
        throw new Error(`${label} ${entry.target}: stale class ${token} for ${entry.utility}`)
      }
    }
  }
}
