import type { InterfaceDeclaration, JSDocTag, Symbol as MorphSymbol, PropertySignature, Type, TypeAliasDeclaration } from 'ts-morph'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {

  Node,
  Project,

  ts,

} from 'ts-morph'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(currentDir, '..', '..')
const apiDir = path.join(repoRoot, 'website', 'docs', 'api')
const apiInterfacesDir = path.join(apiDir, 'interfaces')
const apiV2InterfacesDir = path.join(repoRoot, 'website', 'docs', 'api-v2', 'interfaces')
const entryPath = path.join(repoRoot, 'packages', 'weapp-tailwindcss', 'src', 'typedoc.export.ts')
const tsconfigPath = path.join(repoRoot, 'packages', 'weapp-tailwindcss', 'tsconfig.typedoc.json')

const repoUrl = `https://github.com/sonofmagic/weapp-tailwindcss/blob/${getGitCommitHash()}/`

interface JsDocInfo {
  description: string
  tags: Record<string, string[]>
}

interface PropertyDoc {
  name: string
  optional: boolean
  isFunction: boolean
  typeText: string
  source?: string
  description?: string
  tags: Record<string, string[]>
  parameters?: { name: string, typeText: string }[]
  returns?: string
  nested?: PropertyDoc[]
  orderKey: number
}

interface InterfaceDoc {
  name: string
  source?: string
  description?: string
  tags: Record<string, string[]>
  kind: 'interface' | 'type'
  group?: string
  properties: PropertyDoc[]
}

interface ApiV2PropertyInfo {
  description?: string
  defaultValue?: string
  issueLinks?: string[]
}

const apiV2Cache = loadApiV2Interfaces(apiV2InterfacesDir)

const project = new Project({
  tsConfigFilePath: tsconfigPath,
  skipAddingFilesFromTsConfig: false,
})
const entryFile = project.getSourceFileOrThrow(entryPath)
const exportedDeclarations = entryFile.getExportedDeclarations()

const interfaceDocs: InterfaceDoc[] = []
for (const [name, declarations] of exportedDeclarations) {
  const decl = pickExportDeclaration(declarations)
  if (!decl) {
    continue
  }
  const doc = buildInterfaceDoc(name, decl)
  if (doc) {
    interfaceDocs.push(doc)
  }
}

ensureDir(apiInterfacesDir)
writeIndex(interfaceDocs)
for (const doc of interfaceDocs) {
  const filePath = path.join(apiInterfacesDir, `${doc.name}.md`)
  fs.writeFileSync(filePath, renderInterfaceDoc(doc), 'utf8')
}

console.log(`Generated ${interfaceDocs.length} API docs into ${path.relative(repoRoot, apiDir)}`)

function getGitCommitHash(): string {
  try {
    return execSync('git rev-parse HEAD', { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  }
  catch {
    return 'main'
  }
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function pickExportDeclaration(declarations: Node[]): InterfaceDeclaration | TypeAliasDeclaration | undefined {
  const candidates = declarations.filter(decl =>
    Node.isInterfaceDeclaration(decl) || Node.isTypeAliasDeclaration(decl),
  ) as Array<InterfaceDeclaration | TypeAliasDeclaration>
  if (!candidates.length) {
    return undefined
  }
  const local = candidates.find(decl => !decl.getSourceFile().isInNodeModules())
  return local ?? candidates[0]
}

function buildInterfaceDoc(name: string, decl: InterfaceDeclaration | TypeAliasDeclaration): InterfaceDoc | undefined {
  const jsDoc = readJsDoc(decl)
  const source = getDefinitionLink(decl)
  const group = jsDoc.tags.group?.[0]
  const type = decl.getType()

  const properties = collectProperties(type, apiV2Cache[name])
  if (!properties.length && Node.isTypeAliasDeclaration(decl)) {
    return {
      name,
      kind: 'type',
      source,
      description: jsDoc.description || undefined,
      tags: jsDoc.tags,
      group,
      properties: [],
    }
  }

  return {
    name,
    kind: Node.isInterfaceDeclaration(decl) ? 'interface' : 'type',
    source,
    description: jsDoc.description || undefined,
    tags: jsDoc.tags,
    group,
    properties,
  }
}

function collectProperties(type: Type, apiV2Info?: Record<string, ApiV2PropertyInfo>): PropertyDoc[] {
  const properties = type.getProperties()
  const docs: PropertyDoc[] = []
  for (const symbol of properties) {
    const propertyDoc = buildPropertyDoc(symbol, apiV2Info?.[symbol.getName()])
    if (propertyDoc) {
      docs.push(propertyDoc)
    }
  }
  return docs.sort((a, b) => a.orderKey - b.orderKey)
}

function buildPropertyDoc(symbol: MorphSymbol, apiV2Info?: ApiV2PropertyInfo): PropertyDoc | undefined {
  const declaration = pickPropertyDeclaration(symbol)
  if (!declaration) {
    return undefined
  }
  const name = symbol.getName()
  const optional = isOptionalDeclaration(declaration, symbol)
  const propertyType = symbol.getTypeAtLocation(declaration)
  const isFunction = propertyType.getCallSignatures().length > 0
  const typeText = normalizeOptionalType(
    formatTypeText(propertyType.getText(declaration)),
    optional,
  )
  const jsDoc = readJsDoc(declaration)

  if (!jsDoc.description && apiV2Info?.description) {
    jsDoc.description = apiV2Info.description
  }
  if (!jsDoc.tags.default && apiV2Info?.defaultValue) {
    jsDoc.tags.default = [apiV2Info.defaultValue]
  }
  if (!jsDoc.tags.see && apiV2Info?.issueLinks?.length) {
    jsDoc.tags.see = apiV2Info.issueLinks
  }

  const propertyDoc: PropertyDoc = {
    name,
    optional,
    isFunction,
    typeText,
    source: getDefinitionLink(declaration),
    description: jsDoc.description || undefined,
    tags: jsDoc.tags,
    orderKey: declaration.getStartLineNumber(),
  }

  if (isFunction) {
    const signature = propertyType.getCallSignatures()[0]
    if (signature) {
      propertyDoc.parameters = signature.getParameters().map((param) => {
        const paramType = param.getTypeAtLocation(declaration)
        return {
          name: param.getName(),
          typeText: formatTypeText(paramType.getText(declaration)),
        }
      })
      propertyDoc.returns = formatTypeText(signature.getReturnType().getText(declaration))
    }
  }

  const nested = collectNestedProperties(propertyType)
  if (nested.length > 0) {
    propertyDoc.nested = nested
  }

  return propertyDoc
}

function collectNestedProperties(type: Type): PropertyDoc[] {
  if (!type.isObject() || type.getCallSignatures().length > 0) {
    return []
  }
  const nestedProperties = type.getProperties()
  if (!nestedProperties.length) {
    return []
  }
  const docs: PropertyDoc[] = []
  for (const symbol of nestedProperties) {
    const declaration = pickPropertyDeclaration(symbol)
    if (!declaration) {
      continue
    }
    if (!Node.isPropertySignature(declaration)) {
      continue
    }
    const name = symbol.getName()
    const optional = isOptionalDeclaration(declaration, symbol)
    const propertyType = symbol.getTypeAtLocation(declaration)
    const jsDoc = readJsDoc(declaration)

    docs.push({
      name,
      optional,
      isFunction: propertyType.getCallSignatures().length > 0,
      typeText: normalizeOptionalType(
        formatTypeText(propertyType.getText(declaration)),
        optional,
      ),
      source: getDefinitionLink(declaration),
      description: jsDoc.description || undefined,
      tags: jsDoc.tags,
      orderKey: declaration.getStartLineNumber(),
    })
  }
  return docs.sort((a, b) => a.orderKey - b.orderKey)
}

function pickPropertyDeclaration(symbol: MorphSymbol): PropertySignature | undefined {
  const candidates = symbol.getDeclarations().filter(decl => Node.isPropertySignature(decl)) as PropertySignature[]
  if (!candidates.length) {
    return undefined
  }
  const scored = candidates
    .map(decl => ({
      decl,
      score: scorePropertyDeclaration(decl),
    }))
    .sort((a, b) => b.score - a.score)
  return scored[0]?.decl
}

function scorePropertyDeclaration(decl: PropertySignature): number {
  let score = 0
  if (!decl.getSourceFile().isInNodeModules()) {
    score += 10
  }
  if (decl.getJsDocs().length > 0) {
    score += 5
  }
  return score
}

function isOptionalDeclaration(decl: PropertySignature, symbol: MorphSymbol): boolean {
  if (decl.hasQuestionToken()) {
    return true
  }
  const flags = symbol.getFlags()
  return (flags & ts.SymbolFlags.Optional) !== 0
}

function readJsDoc(node: Node): JsDocInfo {
  const docs = node.getJsDocs()
  if (!docs.length) {
    return { description: '', tags: {} }
  }
  const doc = docs[docs.length - 1]
  const description = (doc.getComment() ?? '').toString().trim()
  const tags: Record<string, string[]> = {}
  for (const tag of doc.getTags()) {
    const name = tag.getTagName()
    const value = readTagText(tag)
    if (!value) {
      continue
    }
    if (!tags[name]) {
      tags[name] = []
    }
    tags[name].push(value)
  }
  return { description, tags }
}

function readTagText(tag: JSDocTag): string {
  const comment = tag.getComment()
  if (!comment) {
    return ''
  }
  if (Array.isArray(comment)) {
    return comment.map(node => node.getText()).join('').trim()
  }
  return comment.toString().trim()
}

function formatTypeText(text: string): string {
  return text.replace(/\s+/g, ' ')
}

function normalizeOptionalType(typeText: string, optional: boolean): string {
  if (!optional) {
    return typeText
  }
  return typeText.replace(/\s*\|\s*undefined$/i, '')
}

function getDefinitionLink(node: Node): string | undefined {
  const sourceFile = node.getSourceFile()
  const filePath = sourceFile.getFilePath()
  const relPath = toPosixPath(path.relative(repoRoot, filePath))
  const line = node.getStartLineNumber()

  if (sourceFile.isInNodeModules()) {
    return `${relPath}:${line}`
  }
  return `[${relPath}:${line}](${repoUrl}${relPath}#L${line})`
}

function toPosixPath(p: string): string {
  return p.replace(/\\/g, '/')
}

function writeIndex(docs: InterfaceDoc[]) {
  const interfaceDocs = docs.filter(doc => !doc.group)
  const grouped = new Map<string, InterfaceDoc[]>()
  for (const doc of docs) {
    if (!doc.group) {
      continue
    }
    if (!grouped.has(doc.group)) {
      grouped.set(doc.group, [])
    }
    grouped.get(doc.group)!.push(doc)
  }

  let content = '# weapp-tailwindcss\n\n'
  if (interfaceDocs.length) {
    content += '## 接口\n\n'
    for (const doc of interfaceDocs) {
      content += `- [${doc.name}](interfaces/${doc.name}.md)\n`
    }
    content += '\n'
  }

  for (const [groupName, docsForGroup] of grouped) {
    content += `## ${groupName}\n\n`
    for (const doc of docsForGroup) {
      content += `- [${doc.name}](interfaces/${doc.name}.md)\n`
    }
    content += '\n'
  }

  fs.writeFileSync(path.join(apiDir, 'index.md'), `${content.trimEnd()}\n`, 'utf8')
}

function renderInterfaceDoc(doc: InterfaceDoc): string {
  const lines: string[] = []
  lines.push(`# ${doc.kind === 'interface' ? '接口' : '类型别名'}: ${doc.name}`)
  lines.push('')
  if (doc.source) {
    lines.push(`定义于: ${doc.source}`)
    lines.push('')
  }
  if (doc.description) {
    lines.push(doc.description)
    lines.push('')
  }

  if (doc.tags.since?.length) {
    lines.push('## 添加于')
    lines.push('')
    lines.push(...doc.tags.since)
    lines.push('')
  }

  if (doc.tags.remarks?.length) {
    lines.push('## 备注')
    lines.push('')
    lines.push(doc.tags.remarks.join('\n\n'))
    lines.push('')
  }

  if (doc.tags.see?.length) {
    lines.push('## 参阅')
    lines.push('')
    if (doc.tags.see.length > 1) {
      doc.tags.see.forEach(item => lines.push(`- ${item}`))
    }
    else {
      lines.push(doc.tags.see[0])
    }
    lines.push('')
  }

  const grouped = groupProperties(doc.properties)
  for (const group of grouped) {
    lines.push(`## ${group.title}`)
    lines.push('')
    group.items.forEach((prop, idx) => {
      lines.push(renderProperty(prop, 3))
      if (idx < group.items.length - 1) {
        lines.push('\n***\n')
      }
    })
    lines.push('')
  }

  return `${lines.join('\n').trimEnd()}\n`
}

function groupProperties(properties: PropertyDoc[]): Array<{ title: string, items: PropertyDoc[] }> {
  if (!properties.length) {
    return []
  }
  const grouped = new Map<string, PropertyDoc[]>()
  const orderMap = new Map<string, number>()
  for (const prop of properties) {
    const group = prop.tags.group?.[0] ?? '属性'
    if (!grouped.has(group)) {
      grouped.set(group, [])
      orderMap.set(group, orderMap.size)
    }
    grouped.get(group)!.push(prop)
  }
  const result: Array<{ title: string, items: PropertyDoc[] }> = []
  for (const [title, items] of grouped) {
    result.push({
      title,
      items: items.sort((a, b) => a.orderKey - b.orderKey),
    })
  }
  return result.sort((a, b) => {
    const aKey = parseGroupOrder(a.title)
    const bKey = parseGroupOrder(b.title)
    if (aKey.order !== bKey.order) {
      return aKey.order - bKey.order
    }
    if (aKey.hasNumber !== bKey.hasNumber) {
      return aKey.hasNumber ? -1 : 1
    }
    if (a.title !== b.title) {
      return a.title.localeCompare(b.title, 'zh-Hans-CN')
    }
    return (orderMap.get(a.title) ?? 0) - (orderMap.get(b.title) ?? 0)
  })
}

function parseGroupOrder(title: string): { hasNumber: boolean, order: number } {
  const match = title.match(/^(\\d+)/)
  if (!match) {
    return { hasNumber: false, order: Number.MAX_SAFE_INTEGER }
  }
  return { hasNumber: true, order: Number.parseInt(match[1], 10) }
}

function renderProperty(prop: PropertyDoc, level: number): string {
  const lines: string[] = []
  const heading = `${'#'.repeat(level)} ${prop.name}${prop.isFunction ? '()' : ''}${prop.optional ? '?' : ''}`
  lines.push(heading)
  lines.push('')

  const optionalLabel = prop.optional ? '`optional` ' : ''
  lines.push(`> ${optionalLabel}**${prop.name}${prop.isFunction ? '()' : ''}**: \`${prop.typeText}\``)
  lines.push('')

  if (prop.source) {
    lines.push(`定义于: ${prop.source}`)
    lines.push('')
  }

  if (prop.description) {
    lines.push(prop.description)
    lines.push('')
  }

  if (prop.tags.since?.length) {
    lines.push(`${'#'.repeat(level + 1)} 添加于`)
    lines.push('')
    lines.push(...prop.tags.since)
    lines.push('')
  }

  if (prop.tags.see?.length) {
    lines.push(`${'#'.repeat(level + 1)} 参阅`)
    lines.push('')
    if (prop.tags.see.length > 1) {
      prop.tags.see.forEach(item => lines.push(`- ${item}`))
    }
    else {
      lines.push(prop.tags.see[0])
    }
    lines.push('')
  }

  if (prop.tags.remarks?.length) {
    lines.push(`${'#'.repeat(level + 1)} 备注`)
    lines.push('')
    lines.push(prop.tags.remarks.join('\n\n'))
    lines.push('')
  }

  if (prop.tags.default?.length) {
    lines.push(`${'#'.repeat(level + 1)} 默认值`)
    lines.push('')
    lines.push(renderDefaultValue(prop.tags.default.join('\n')))
    lines.push('')
  }

  if (prop.tags.example?.length) {
    lines.push(`${'#'.repeat(level + 1)} 示例`)
    lines.push('')
    lines.push(prop.tags.example.join('\n\n'))
    lines.push('')
  }

  if (prop.parameters?.length) {
    lines.push(`${'#'.repeat(level + 1)} 参数`)
    lines.push('')
    prop.parameters.forEach((param) => {
      lines.push(`${'#'.repeat(level + 2)} ${param.name}`)
      lines.push('')
      lines.push(`\`${param.typeText}\``)
      lines.push('')
    })
  }

  if (prop.returns) {
    lines.push(`${'#'.repeat(level + 1)} 返回`)
    lines.push('')
    lines.push(`\`${prop.returns}\``)
    lines.push('')
  }

  if (prop.nested?.length) {
    prop.nested.forEach((nested) => {
      lines.push(renderProperty(nested, level + 1))
    })
  }

  return lines.join('\n').trimEnd()
}

function renderDefaultValue(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }
  if (trimmed.includes('```') || trimmed.includes('<br/>') || trimmed.startsWith('`')) {
    return trimmed
  }
  return `\`\`\`ts\n${trimmed}\n\`\`\``
}

function loadApiV2Interfaces(dirPath: string): Record<string, Record<string, ApiV2PropertyInfo>> {
  if (!fs.existsSync(dirPath)) {
    return {}
  }
  const entries = fs.readdirSync(dirPath)
  const result: Record<string, Record<string, ApiV2PropertyInfo>> = {}

  for (const entry of entries) {
    if (!entry.endsWith('.md') || entry.startsWith('_')) {
      continue
    }
    const name = entry.replace(/\.md$/, '')
    const content = fs.readFileSync(path.join(dirPath, entry), 'utf8')
    result[name] = parseApiV2Interface(content)
  }

  return result
}

function parseApiV2Interface(content: string): Record<string, ApiV2PropertyInfo> {
  const map: Record<string, ApiV2PropertyInfo> = {}
  const sections = content.split(/\n### /g)
  sections.shift()

  for (const section of sections) {
    const [headingLine, ...restLines] = section.split('\n')
    const propertyName = headingLine.trim().split(' ')[0]
    if (!propertyName) {
      continue
    }
    const sectionText = restLines.join('\n')
    map[propertyName] = {
      description: extractApiV2Block(sectionText, '**`Description`**'),
      defaultValue: extractApiV2Block(sectionText, '**`Default`**'),
      issueLinks: extractApiV2Links(sectionText, '**`Issue`**'),
    }
  }

  return map
}

function extractApiV2Block(section: string, marker: string): string | undefined {
  const idx = section.indexOf(marker)
  if (idx < 0) {
    return undefined
  }
  const rest = section.slice(idx + marker.length)
  const lines = rest.split('\n')
  const collected: string[] = []
  for (const line of lines) {
    if (line.startsWith('**`')) {
      break
    }
    if (line.startsWith('####') || line.startsWith('---')) {
      break
    }
    collected.push(line)
  }
  const text = collected.join('\n').trim()
  return text || undefined
}

function extractApiV2Links(section: string, marker: string): string[] | undefined {
  const block = extractApiV2Block(section, marker)
  if (!block) {
    return undefined
  }
  const links = block.split(/\s+/).map(item => item.trim()).filter(Boolean)
  return links.length ? links : undefined
}
