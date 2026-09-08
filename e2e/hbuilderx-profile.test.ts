import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, it } from 'vitest'
import { prepareHBuilderXCIFirstRun } from '../scripts/ci/hbuilderx-profile.mjs'

it('仅为新的 CI profile 预置首次界面状态，重复运行保持现有配置', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hx 中文 & profile-'))
  try {
    const initial = await prepareHBuilderXCIFirstRun(root)
    expect(initial.created).toBe(true)
    expect(await readFile(initial.file, 'utf8')).toBe('[uistate]\nfirst=false\n')
    const existing = '[General]\r\nsetting=keep\r\n[uistate]\r\nfirst=false\r\n[other]\r\nvalue=unchanged\r\n'
    await writeFile(initial.file, existing)
    expect((await prepareHBuilderXCIFirstRun(root)).created).toBe(false)
    expect(await readFile(initial.file, 'utf8')).toBe(existing)
    await writeFile(initial.file, '[other]\nfirst=false\n[uistate]\nfirst=true\n')
    await expect(prepareHBuilderXCIFirstRun(root)).rejects.toThrow('不覆盖')
    expect(await readFile(initial.file, 'utf8')).toContain('first=true')
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
})

it('缺少 APPDATA 时不回退到当前目录写配置', async () => {
  await expect(prepareHBuilderXCIFirstRun(undefined)).rejects.toThrow('APPDATA')
})
