import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

/** 仅用于独立 Windows CI 的上游协议诊断，结果不作为未修改官方 IDE 的验收证据。 */
export async function traceHBuilderXCLI(installRoot, artifactRoot) {
  if (process.env.GITHUB_ACTIONS !== 'true') {
    throw new Error('禁止在用户 IDE 安装中插入协议诊断')
  }
  const edits = [
    [['plugin-manager', 'out.js'], 'e.onRequest("commands/plugincommand",function(e,t){', 'console.error("[WT-CLI] receive",e.id,e.clientId,typeof s[e.id]);'],
    [['plugin-manager', 'out.js'], 'e.onNotification("commands/cliExit",function(){', 'console.error("[WT-CLI] exit-notification",[...l.keys()]);'],
    [['uniapp-extension', 'out', 'index.js'], 'L=async(e,t={})=>{', 'console.error("[WT-CLI] init",e.args?.project,e.cliconsole?.clientId);'],
  ]
  const records = []
  for (const [relative, anchor, insertion] of edits) {
    const file = path.resolve(installRoot, 'plugins', ...relative)
    const source = await readFile(file, 'utf8')
    if (source.split(anchor).length !== 2) {
      throw new Error(`官方诊断锚点不唯一：${relative} ${anchor}`)
    }
    const output = source.replace(anchor, anchor + insertion)
    records.push({ file, anchor, before: createHash('sha256').update(source).digest('hex'), after: createHash('sha256').update(output).digest('hex') })
    await writeFile(file, output)
  }
  await writeFile(path.join(artifactRoot, 'upstream-trace.json'), JSON.stringify(records, null, 2))
}
