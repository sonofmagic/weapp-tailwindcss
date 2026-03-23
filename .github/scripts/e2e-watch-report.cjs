#!/usr/bin/env node

/* eslint-disable ts/no-require-imports */

const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')

/** 匹配换行符（兼容 CRLF） */
const CRLF_RE = /\r?\n/
/** 替换换行为转义表示 */
const NEWLINE_REPLACE_RE = /\n/g
/** 匹配 rollback 阶段（不区分大小写） */
const ROLLBACK_RE = /rollback/i
/** 按管道符分隔 token */
const TOKEN_SEPARATOR_RE = /\s+\|\s+/
/** 匹配截断的 bg hex / 未闭合 bg / 未闭合 px token（多行） */
const BG_PX_FALLBACK_RE = /\bbg-\s+\[#?[0-9a-fA-F]{3,8}\]?|\bbg-\[[^\]]*$|\bpx-\[[^\]]*$/m
/** 截断的 bg hex token */
const TRUNCATED_BG_HEX_RE = /\bbg-\s+\[#?[0-9a-fA-F]{3,8}\]?/g
/** 未闭合 bg token */
const UNTERMINATED_BG_RE = /\bbg-\[[^\]]*$/gm
/** 未闭合 px token */
const UNTERMINATED_PX_RE = /\bpx-\[[^\]]*$/gm
/** bg token 内含空白 */
const BG_WHITESPACE_INSIDE_RE = /\bbg-\[[^\]\s]*\s[^\]\s]*\]/g
/** px token 内含空白 */
const PX_WHITESPACE_INSIDE_RE = /\bpx-\[[^\]\s]*\s[^\]\s]*\]/g
/** 缓存失效相关关键词 */
const CACHE_INVALIDATION_RE = /invalidation|context-not-found|cache/
/** 文件系统竞态相关关键词 */
const FS_RACE_RE = /enoent|eperm|ebusy|eacces|crlf|lf|rename|path/
/** 进程/超时相关关键词 */
const PROCESS_TIMEOUT_RE = /timeout|exceeded|watch process exited|sigkill|fatal|killed/
/** 匹配 mutation kind */
const MUTATION_KIND_RE = /mutation=(template|script|style)/g
/** 匹配 round 名称 */
const ROUND_NAME_RE = /round=([a-z0-9-]+)/g

const ROOT_DIR = path.resolve(process.cwd(), 'e2e/benchmark/e2e-watch-hmr')
const SNAPSHOTS_DIR = path.join(ROOT_DIR, 'snapshots')
const FAILURES_DIR = path.join(ROOT_DIR, 'failures')

function ensureFailuresDir() {
  fs.mkdirSync(FAILURES_DIR, { recursive: true })
}

function readUtf8(file) {
  try {
    return fs.readFileSync(file, 'utf8')
  }
  catch {
    return ''
  }
}

function listFilesSafe(dir, filter) {
  if (!fs.existsSync(dir)) {
    return []
  }
  return fs
    .readdirSync(dir)
    .filter(filter)
    .map(name => path.join(dir, name))
}

function parseKvContent(content) {
  const out = {}
  for (const line of content.split(CRLF_RE)) {
    const index = line.indexOf('=')
    if (index <= 0) {
      continue
    }
    const key = line.slice(0, index).trim()
    const value = line.slice(index + 1).trim()
    out[key] = value
  }
  return out
}

function summarizeDiff(before, after) {
  if (before === after) {
    return 'no-diff'
  }
  const minLength = Math.min(before.length, after.length)
  let index = 0
  while (
    index < minLength
    && before.charCodeAt(index) === after.charCodeAt(index)
  ) {
    index += 1
  }
  const beforeContext = before
    .slice(Math.max(0, index - 40), Math.min(before.length, index + 120))
    .replace(NEWLINE_REPLACE_RE, '\\n')
  const afterContext = after
    .slice(Math.max(0, index - 40), Math.min(after.length, index + 120))
    .replace(NEWLINE_REPLACE_RE, '\\n')
  return `firstDiff=${index}, len=${before.length}->${after.length}\n  before=${beforeContext}\n  after=${afterContext}`
}

function parseSnapshots() {
  const dirs = fs.existsSync(SNAPSHOTS_DIR)
    ? fs
        .readdirSync(SNAPSHOTS_DIR, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(item => path.join(SNAPSHOTS_DIR, item.name))
    : []

  const records = []
  for (const dir of dirs) {
    const metaPath = path.join(dir, 'meta.json')
    if (!fs.existsSync(metaPath)) {
      continue
    }
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
      records.push({ dir, meta })
    }
    catch {}
  }
  records.sort((a, b) => a.dir.localeCompare(b.dir))
  return records
}

function resolvePhase(rawPhase, errorText) {
  if (rawPhase === 'delete') {
    return 'rollback'
  }
  if (rawPhase === 'add' || rawPhase === 'modify') {
    return 'hot-update'
  }
  if (ROLLBACK_RE.test(errorText)) {
    return 'rollback'
  }
  return 'hot-update'
}

function pickPrimaryFailure(failureLogs, failureSnapshots) {
  if (failureLogs.length > 0) {
    const file = failureLogs[0]
    const kv = parseKvContent(readUtf8(file))
    return {
      source: 'log',
      file,
      mutation: kv.mutation || 'unknown',
      round: kv.round || 'unknown',
      phaseRaw: kv.phase || 'unknown',
      phase: resolvePhase(kv.phase || '', kv.error || ''),
      project: kv.project || 'unknown',
      sourceFile: kv.source || 'unknown',
      tokens: (kv.tokens || '').split(TOKEN_SEPARATOR_RE).filter(Boolean),
      error: kv.error || '',
    }
  }

  if (failureSnapshots.length > 0) {
    const item = failureSnapshots.at(-1)
    return {
      source: 'snapshot',
      file: item.dir,
      mutation: item.meta.mutationKind || 'unknown',
      round: item.meta.roundName || 'unknown',
      phaseRaw: item.meta.phase || 'unknown',
      phase: resolvePhase(item.meta.phase || '', ''),
      project: item.meta.project || 'unknown',
      sourceFile: item.meta.sourceFile || 'unknown',
      tokens: [],
      error: 'snapshot stage failed without structured failure log',
    }
  }

  return {
    source: 'none',
    file: '',
    mutation: 'unknown',
    round: 'unknown',
    phaseRaw: 'unknown',
    phase: 'unknown',
    project: 'unknown',
    sourceFile: 'unknown',
    tokens: [],
    error: 'no failure logs/snapshots captured',
  }
}

function pickFailureSnapshot(primary, snapshots) {
  const candidates = snapshots.filter(item => item.meta.stage === 'failure')
  if (candidates.length === 0) {
    return undefined
  }
  const exact = candidates.find(
    item =>
      item.meta.mutationKind === primary.mutation
      && item.meta.roundName === primary.round
      && item.meta.phase === primary.phaseRaw,
  )
  return exact || candidates.at(-1)
}

function pickMetricFromReport(report, primary) {
  if (!report || !Array.isArray(report.cases)) {
    return undefined
  }
  for (const oneCase of report.cases) {
    const metrics = Array.isArray(oneCase.mutationMetrics)
      ? oneCase.mutationMetrics
      : []
    for (const metric of metrics) {
      if (metric.mutationKind !== primary.mutation) {
        continue
      }
      const rounds = Array.isArray(metric.rounds) ? metric.rounds : []
      const round
        = rounds.find(item => item.roundName === primary.round) || rounds[0]
      if (!round) {
        continue
      }
      return {
        caseName: oneCase.name || oneCase.project || 'unknown',
        classTokens: round.classTokens || metric.classTokens || [],
        escapedClasses: round.escapedClasses || metric.escapedClasses || [],
        verifiedEscapedCount: Array.isArray(
          metric.verifiedGlobalStyleEscapedClasses,
        )
          ? metric.verifiedGlobalStyleEscapedClasses.length
          : 0,
      }
    }
  }
  return undefined
}

function pickSnippet(source, probes) {
  if (!source) {
    return '(empty)'
  }

  let hitIndex = -1
  for (const probe of probes) {
    if (!probe) {
      continue
    }
    const index = source.indexOf(probe)
    if (index >= 0) {
      hitIndex = index
      break
    }
  }

  if (hitIndex < 0) {
    const fallback = source.match(BG_PX_FALLBACK_RE)
    if (fallback?.index != null) {
      hitIndex = fallback.index
    }
  }

  if (hitIndex < 0) {
    return source.slice(0, 260)
  }

  const start = Math.max(0, hitIndex - 140)
  const end = Math.min(source.length, hitIndex + 280)
  return source.slice(start, end)
}

function detectTokenAnomalies(source) {
  const patterns = [
    { name: 'truncated-bg-hex', re: TRUNCATED_BG_HEX_RE },
    { name: 'unterminated-bg-token', re: UNTERMINATED_BG_RE },
    { name: 'unterminated-px-token', re: UNTERMINATED_PX_RE },
    { name: 'bg-whitespace-inside-token', re: BG_WHITESPACE_INSIDE_RE },
    { name: 'px-whitespace-inside-token', re: PX_WHITESPACE_INSIDE_RE },
  ]

  const findings = []
  for (const { name, re } of patterns) {
    const matched = source.match(re)
    if (matched?.length) {
      findings.push({
        name,
        sample: matched[0],
      })
    }
  }
  return findings
}

function scoreAttribution(primary, evidence) {
  const text = `${primary.error}\n${evidence.failureLogJoined}`.toLowerCase()
  const scores = new Map([
    ['cache key/invalidation', 0],
    ['token extraction', 0],
    ['transform emit mismatch', 0],
    ['文件系统竞态/路径换行差异', 0],
    ['进程/超时问题', 0],
  ])

  if (CACHE_INVALIDATION_RE.test(text)) {
    scores.set(
      'cache key/invalidation',
      scores.get('cache key/invalidation') + 2,
    )
  }
  if (evidence.tokenAnomalies.length > 0 || evidence.tokenCount === 0) {
    scores.set('token extraction', scores.get('token extraction') + 3)
  }
  if (
    evidence.escapedCount > 0
    && evidence.wxssEscapedHits === 0
    && evidence.tokenCount > 0
  ) {
    scores.set(
      'transform emit mismatch',
      scores.get('transform emit mismatch') + 3,
    )
  }
  if (FS_RACE_RE.test(text)) {
    scores.set(
      '文件系统竞态/路径换行差异',
      scores.get('文件系统竞态/路径换行差异') + 3,
    )
  }
  if (PROCESS_TIMEOUT_RE.test(text)) {
    scores.set('进程/超时问题', scores.get('进程/超时问题') + 3)
  }
  if (primary.phase === 'rollback') {
    scores.set(
      'cache key/invalidation',
      scores.get('cache key/invalidation') + 1,
    )
  }

  return [...scores.entries()].sort((a, b) => b[1] - a[1])
}

function buildSuggestions(topCategories) {
  const top = topCategories.slice(0, 2).map(item => item[0])
  const fixSteps = []
  const tests = []

  if (top.includes('cache key/invalidation')) {
    fixSteps.push(
      '补齐增量缓存 key（至少覆盖 mutation kind / phase / output path 标识），并在 script-only 变更时强制校验 html 回填路径。',
    )
    tests.push(
      '新增 script-only 热更新下 html cache replay 一致性断言（含 issue33-arbitrary round）。',
    )
  }
  if (top.includes('token extraction')) {
    fixSteps.push(
      '在 token 提取阶段增加任意值 token 完整性守卫（闭合括号、空白、截断），异常时降级为失败并打点。',
    )
    tests.push('覆盖 token 截断、未闭合、空白插入三类异常输入。')
  }
  if (top.includes('transform emit mismatch')) {
    fixSteps.push(
      '将 token->escaped->wxss emit 建立同轮一致性检查，命中不足直接失败。',
    )
    tests.push(
      '补 script/template add/modify/delete 后 escaped class 在 wxss 命中回归。',
    )
  }
  if (top.includes('文件系统竞态/路径换行差异')) {
    fixSteps.push(
      '对读写与 stat 增加短暂重试，并统一 CRLF/LF 与路径规范化策略。',
    )
    tests.push('加入 Windows 路径分隔符与 CRLF 混用场景。')
  }
  if (top.includes('进程/超时问题')) {
    fixSteps.push(
      '上调平台差异化 timeout/poll，并增强 watcher 退出与超时诊断日志。',
    )
    tests.push('补充 Windows/macOS 慢机预算回归与进程树退出校验。')
  }

  if (fixSteps.length === 0) {
    fixSteps.push(
      '先补充失败现场日志（dirty file、token、round、phase）再细化归因。',
    )
    tests.push('补一条失败快照可重放用例，确保下次能稳定复现。')
  }

  return {
    top,
    fixSteps: fixSteps.slice(0, 3),
    tests: tests.slice(0, 5),
  }
}

function generateDiffSummary() {
  ensureFailuresDir()
  const snapshots = parseSnapshots()
  const successMap = new Map()
  const failureRecords = []

  for (const item of snapshots) {
    const key = `${item.meta.project}|${item.meta.mutationKind}|${item.meta.phase}|${item.meta.roundName}`
    if (item.meta.stage === 'success') {
      const previous = successMap.get(key)
      if (!previous || previous.dir < item.dir) {
        successMap.set(key, item)
      }
    }
    else if (item.meta.stage === 'failure') {
      failureRecords.push({
        key,
        ...item,
      })
    }
  }

  const lines = []
  lines.push('# e2e-watch failure diff summary')
  lines.push('')

  const failureLogs = listFilesSafe(FAILURES_DIR, name =>
    name.endsWith('.log'))
  if (failureLogs.length > 0) {
    lines.push('## failure logs')
    for (const file of failureLogs) {
      lines.push(`- ${path.basename(file)}`)
      const content = readUtf8(file).trim()
      if (content) {
        for (const line of content.split(CRLF_RE)) {
          lines.push(`  ${line}`)
        }
      }
    }
    lines.push('')
  }

  lines.push('## snapshot diffs')
  if (failureRecords.length === 0) {
    lines.push('no failure snapshot found')
  }
  else {
    for (const failure of failureRecords) {
      const success = successMap.get(failure.key)
      lines.push(`- key: ${failure.key}`)
      lines.push(`  failureDir: ${path.basename(failure.dir)}`)
      if (!success) {
        lines.push('  successDir: <missing>')
        continue
      }
      lines.push(`  successDir: ${path.basename(success.dir)}`)
      for (const file of ['index.wxml', 'index.js', 'bundle.wxss']) {
        const before = readUtf8(path.join(success.dir, file))
        const after = readUtf8(path.join(failure.dir, file))
        lines.push(`  ${file}: ${summarizeDiff(before, after)}`)
      }
    }
  }

  fs.writeFileSync(
    path.join(FAILURES_DIR, 'diff-summary.txt'),
    `${lines.join('\n')}\n`,
    'utf8',
  )
}

function generateRootCauseReport() {
  ensureFailuresDir()

  const failureLogFiles = listFilesSafe(FAILURES_DIR, name =>
    name.endsWith('.log')).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
  const failureLogsParsed = failureLogFiles.map(file => ({
    file,
    kv: parseKvContent(readUtf8(file)),
  }))

  const snapshots = parseSnapshots()
  const failureSnapshots = snapshots.filter(
    item => item.meta.stage === 'failure',
  )
  const primary = pickPrimaryFailure(failureLogFiles, failureSnapshots)
  const snapshot = pickFailureSnapshot(primary, snapshots)

  const latestReportFile = listFilesSafe(ROOT_DIR, name =>
    name.endsWith('.json')).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0]
  let latestReport
  try {
    latestReport = latestReportFile
      ? JSON.parse(readUtf8(latestReportFile))
      : undefined
  }
  catch {}

  const metric = pickMetricFromReport(latestReport, primary)
  const classTokens = metric?.classTokens?.length
    ? metric.classTokens
    : primary.tokens
  const escapedClasses = metric?.escapedClasses || []

  const wxml = snapshot ? readUtf8(path.join(snapshot.dir, 'index.wxml')) : ''
  const js = snapshot ? readUtf8(path.join(snapshot.dir, 'index.js')) : ''
  const wxss = snapshot ? readUtf8(path.join(snapshot.dir, 'bundle.wxss')) : ''

  const probes = [...classTokens, ...escapedClasses].slice(0, 6)
  const wxmlSnippet = pickSnippet(wxml, probes)
  const jsSnippet = pickSnippet(js, probes)
  const wxssSnippet = pickSnippet(wxss, probes)

  const tokenAnomalies = [
    ...detectTokenAnomalies(wxml),
    ...detectTokenAnomalies(js),
    ...detectTokenAnomalies(wxss),
  ]

  const wxssEscapedHits = escapedClasses.filter(token =>
    wxss.includes(token),
  ).length
  const wxmlEscapedHits = escapedClasses.filter(token =>
    wxml.includes(token),
  ).length
  const jsEscapedHits = escapedClasses.filter(token =>
    js.includes(token),
  ).length
  const rawTokenWxssHits = classTokens.filter(token =>
    wxss.includes(token),
  ).length
  const unescapedAnomaly
    = escapedClasses.length > 0 && wxssEscapedHits === 0 && rawTokenWxssHits > 0

  const evidence = {
    tokenCount: classTokens.length,
    escapedCount: escapedClasses.length,
    wxssEscapedHits,
    wxmlEscapedHits,
    jsEscapedHits,
    rawTokenWxssHits,
    tokenAnomalies,
    failureLogJoined: failureLogsParsed
      .map(item => readUtf8(item.file))
      .join('\n'),
  }

  const categoryScores = scoreAttribution(primary, evidence)
  const suggestions = buildSuggestions(categoryScores)
  const runUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`

  const lines = []
  lines.push('# e2e-watch 根因归因报告')
  lines.push('')
  lines.push(`- generated_at: ${new Date().toISOString()}`)
  lines.push(`- run: ${runUrl}`)
  lines.push('')
  lines.push('## 1. 失败定位')
  lines.push(`- OS: ${process.env.RUNNER_OS}`)
  lines.push(`- watch_case: ${process.env.WATCH_CASE || 'unknown'}`)
  lines.push(`- mutation kind: ${primary.mutation}`)
  lines.push(`- mutation round: ${primary.round}`)
  lines.push(`- phase: ${primary.phase} (raw: ${primary.phaseRaw})`)
  lines.push(`- source: ${primary.sourceFile}`)
  lines.push(`- error: ${primary.error || 'n/a'}`)
  lines.push('')
  lines.push('## 2. 证据')
  lines.push('### 2.1 产物片段 (必要上下文)')
  lines.push('')
  lines.push('#### wxml')
  lines.push('```xml')
  lines.push(wxmlSnippet)
  lines.push('```')
  lines.push('')
  lines.push('#### js')
  lines.push('```js')
  lines.push(jsSnippet)
  lines.push('```')
  lines.push('')
  lines.push('#### wxss')
  lines.push('```css')
  lines.push(wxssSnippet)
  lines.push('```')
  lines.push('')
  lines.push('### 2.2 token / escaped class 统计')
  lines.push(`- token extracted count: ${classTokens.length}`)
  lines.push(`- escaped class count: ${escapedClasses.length}`)
  lines.push(
    `- escaped hits: wxml=${wxmlEscapedHits}, js=${jsEscapedHits}, wxss=${wxssEscapedHits}`,
  )
  lines.push(`- raw token hits in wxss: ${rawTokenWxssHits}`)
  lines.push(
    `- verified escaped count from report: ${metric?.verifiedEscapedCount ?? 'n/a'}`,
  )
  lines.push('')
  lines.push('### 2.3 异常检查')
  lines.push(`- token 截断/损坏: ${tokenAnomalies.length > 0 ? 'yes' : 'no'}`)
  if (tokenAnomalies.length > 0) {
    for (const item of tokenAnomalies.slice(0, 6)) {
      lines.push(`  - ${item.name}: ${item.sample}`)
    }
  }
  lines.push(`- 未转义异常: ${unescapedAnomaly ? 'yes' : 'no'}`)
  lines.push('')
  lines.push('## 3. 归因分类')
  for (const [category, score] of categoryScores) {
    lines.push(`- ${category}: score=${score}`)
  }
  lines.push('')
  lines.push('## 4. 结论与修复建议')
  lines.push('### 最可能根因 (1-2条)')
  if (suggestions.top.length === 0) {
    lines.push('1. 证据不足，优先补齐失败日志后再归因。')
  }
  else {
    suggestions.top.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`)
    })
  }
  lines.push('')
  lines.push('### 最短修复路径 (最多3步)')
  suggestions.fixSteps.forEach((item, index) => {
    lines.push(`${index + 1}. ${item}`)
  })
  lines.push('')
  lines.push('### 需要补的测试点')
  suggestions.tests.forEach((item) => {
    lines.push(`- ${item}`)
  })
  lines.push('')

  fs.writeFileSync(
    path.join(FAILURES_DIR, 'root-cause-report.md'),
    `${lines.join('\n')}\n`,
    'utf8',
  )
}

function publishJobSummary() {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (!summaryPath) {
    return
  }

  const title = process.env.SUMMARY_TITLE || 'e2e-watch'
  const rootCauseReportPath = path.join(FAILURES_DIR, 'root-cause-report.md')

  const reportFiles = listFilesSafe(ROOT_DIR, name => name.endsWith('.json'))
  reportFiles.sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs)
  const latestReport = reportFiles.at(-1)

  const failedKinds = new Set()
  const failedRounds = new Set()
  if (fs.existsSync(FAILURES_DIR)) {
    const logs = fs
      .readdirSync(FAILURES_DIR)
      .filter(name => name.endsWith('.log'))
    for (const log of logs) {
      const content = fs.readFileSync(path.join(FAILURES_DIR, log), 'utf8')
      const kindMatches
        = content.match(MUTATION_KIND_RE) || []
      const roundMatches = content.match(ROUND_NAME_RE) || []
      for (const matched of kindMatches) {
        failedKinds.add(matched.replace('mutation=', ''))
      }
      for (const matched of roundMatches) {
        failedRounds.add(matched.replace('round=', ''))
      }
    }
  }

  const lines = []
  lines.push(`## ${title}`)
  lines.push(`- OS: ${process.env.RUNNER_OS}`)
  lines.push(`- watch_case: ${process.env.WATCH_CASE || 'unknown'}`)
  lines.push(`- round_profile: ${process.env.ROUND_PROFILE || 'unknown'}`)
  lines.push(
    `- report: ${latestReport ? path.basename(latestReport) : 'not-found'}`,
  )
  lines.push(
    `- failed mutation kind: ${failedKinds.size > 0 ? [...failedKinds].join(', ') : 'none'}`,
  )
  lines.push(
    `- failed round: ${failedRounds.size > 0 ? [...failedRounds].join(', ') : 'none'}`,
  )
  lines.push(
    `- RCA report: ${fs.existsSync(rootCauseReportPath) ? '[root-cause-report.md](./e2e/benchmark/e2e-watch-hmr/failures/root-cause-report.md)' : 'not-found'}`,
  )

  fs.appendFileSync(summaryPath, `${lines.join('\n')}\n`, 'utf8')
}

function main() {
  const command = process.argv[2]
  if (command === 'diff-summary') {
    generateDiffSummary()
    return
  }
  if (command === 'root-cause-report') {
    generateRootCauseReport()
    return
  }
  if (command === 'job-summary') {
    publishJobSummary()
    return
  }
  throw new Error(`unknown command: ${command || '(empty)'}`)
}

try {
  main()
}
catch (error) {
  const message
    = error instanceof Error ? error.stack || error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exit(1)
}
