import type { ProjectEntry } from './shared'
import fs from 'node:fs/promises'
import automator from 'miniprogram-automator'
import path from 'pathe'
import { describe, it } from 'vitest'
import { formatWxml, loadCss, projectFilter, removeWxmlId, resolveSnapshotFile, twExtract, wait } from './shared'

interface ProjectTestOptions {
  suite: string
  fixturesDir: string
  describeTitle?: string
  allowExtractionFailure?: boolean
}

export function defineProjectTest(entry: ProjectEntry, options: ProjectTestOptions) {
  const filtered = projectFilter([entry])
  const activeEntry = filtered[0] ?? entry
  const register = filtered.length > 0 ? it : it.skip
  const describeTitle = options.describeTitle ?? options.suite

  describe(describeTitle, () => {
    register(activeEntry.name, async () => {
      await runProjectTest(activeEntry, options)
    })
  })
}

async function runProjectTest(entry: ProjectEntry, options: ProjectTestOptions) {
  const projectBase = path.resolve(__dirname, options.fixturesDir)
  const projectPath = path.resolve(projectBase, entry.projectPath)
  const root = path.resolve(projectBase, entry.name)

  try {
    await fs.rm(path.resolve(root, 'node_modules/.cache'), { recursive: true, force: true })
  }
  catch (error: any) {
    const code = error?.code
    if (!(code && ['ENOENT', 'EPERM', 'EBUSY', 'ENOTEMPTY'].includes(code))) {
      throw error
    }
  }

  let extraction
  if (options.allowExtractionFailure) {
    try {
      extraction = await twExtract(root)
    }
    catch {
      extraction = undefined
    }
  }
  else {
    extraction = await twExtract(root)
  }

  const outputFilename = extraction?.output?.filename ?? path.resolve(root, '.tw-patch/tw-class-list.json')
  let json: string
  try {
    json = await fs.readFile(outputFilename, 'utf8')
  }
  catch (error: any) {
    const code = error?.code
    if (code && ['ENOENT', 'EPERM'].includes(code)) {
      json = '[]'
    }
    else {
      throw error
    }
  }

  await expectProjectSnapshot(options.suite, entry.name, 'tw-class-list.json', json)

  const css = await loadCss(path.resolve(projectPath, entry.cssFile))
  await expectProjectSnapshot(options.suite, entry.name, path.basename(entry.cssFile), css)

  if (entry.skipOpenAutomator) {
    await wait()
    return
  }

  let miniProgram: any
  try {
    miniProgram = await automator.launch({
      // cliPath: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
      projectPath,
    })
  }
  catch (error: any) {
    if (error?.code === 'EPERM' || /EPERM/i.test(error?.message ?? '')) {
      await wait()
      return
    }
    throw error
  }

  try {
    const page = await miniProgram.reLaunch(entry.url ?? '/pages/index/index')

    if (page) {
      const pageEl = await page.$('page')
      let wxml = await pageEl?.wxml()
      if (wxml) {
        wxml = removeWxmlId(wxml)
        try {
          wxml = await formatWxml(wxml)
        }
        catch {
          console.error(`parse error: ${entry.projectPath}`)
        }

        await expectProjectSnapshot(options.suite, entry.name, 'page.wxml', wxml)
      }

      await page.waitFor(1000)
    }
  }
  finally {
    await miniProgram?.close()
  }

  await wait()
}

async function expectProjectSnapshot(suite: string, projectName: string, fileName: string, content: string) {
  const snapshotPath = await resolveSnapshotFile(__dirname, suite, projectName, fileName)
  await expect(content).toMatchFileSnapshot(snapshotPath)
}
