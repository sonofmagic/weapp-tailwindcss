import type { ProjectEntry } from './shared'
import fs from 'node:fs/promises'
import { deleteAsync } from 'del'
import automator from 'miniprogram-automator'
import path from 'pathe'
import { describe, it } from 'vitest'
import { formatWxml, loadCss, projectFilter, removeWxmlId, resolveSnapshotFile, twExtract, wait } from './shared'

const SNAPSHOT_SUITE = 'e2e'

const TestProjectsEntries: ProjectEntry[] = [
  {
    name: 'uni-app',
    projectPath: 'uni-app/dist/build/mp-weixin',
    cssFile: 'common/main.wxss',
  },
  {
    name: 'uni-app-webpack5',
    projectPath: 'uni-app-webpack5/dist/build/mp-weixin',
    cssFile: 'common/main.wxss',
  },
  {
    name: 'uni-app-webpack-tailwindcss-v4',
    projectPath: 'uni-app-webpack-tailwindcss-v4/dist/build/mp-weixin',
    cssFile: 'common/main.wxss',
  },
  {
    name: 'uni-app-vue3-vite',
    projectPath: 'uni-app-vue3-vite/dist/build/mp-weixin',
    cssFile: 'app.wxss',
  },
  {
    name: 'uni-app-tailwindcss-v4',
    projectPath: 'uni-app-tailwindcss-v4/dist/build/mp-weixin',
    cssFile: 'app.wxss',
  },
  {
    name: 'taro-app',
    projectPath: 'taro-app',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-webpack-tailwindcss-v4',
    projectPath: 'taro-webpack-tailwindcss-v4',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-app-vite',
    projectPath: 'taro-app-vite',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-vite-tailwindcss-v4',
    projectPath: 'taro-vite-tailwindcss-v4',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-vue3-app',
    projectPath: 'taro-vue3-app',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'gulp-app',
    projectPath: 'gulp-app',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'mpx-app',
    projectPath: 'mpx-app/dist/wx',
    cssFile: 'app.wxss',
    url: '/pages/index',
  },
  {
    name: 'mpx-tailwindcss-v4',
    projectPath: 'mpx-tailwindcss-v4/dist/wx',
    cssFile: 'app.wxss',
    url: '/pages/index',
  },
  {
    name: 'native-mina',
    projectPath: 'native-mina',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'rax-app',
    projectPath: 'rax-app/build/wechat-miniprogram',
    cssFile: 'bundle.wxss',
  },
]

async function expectProjectSnapshot(projectName: string, fileName: string, content: string) {
  const snapshotPath = await resolveSnapshotFile(__dirname, SNAPSHOT_SUITE, projectName, fileName)
  await expect(content).toMatchFileSnapshot(snapshotPath)
}

describe('e2e', () => {
  it.each(projectFilter(TestProjectsEntries))('$name', async (config) => {
    const projectPath = path.resolve(__dirname, '../demo', config.projectPath)
    const root = path.resolve(__dirname, '../demo', config.name)

    await deleteAsync([path.resolve(root, 'node_modules/.cache')])
    await twExtract(root)

    const json = await fs.readFile(path.resolve(root, '.tw-patch/tw-class-list.json'), 'utf8')
    await expectProjectSnapshot(config.name, 'tw-class-list.json', json)

    const css = await loadCss(path.resolve(projectPath, config.cssFile))
    await expectProjectSnapshot(config.name, path.basename(config.cssFile), css)

    if (config.skipOpenAutomator) {
      await wait()
      return
    }

    const miniProgram = await automator.launch({
      // cliPath: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
      projectPath,
    })
    const page = await miniProgram.reLaunch(config.url ?? '/pages/index/index')

    if (page) {
      const pageEl = await page.$('page')
      let wxml = await pageEl?.wxml()
      if (wxml) {
        wxml = removeWxmlId(wxml)
        try {
          wxml = await formatWxml(wxml)
        }
        catch {
          console.error(`parse error: ${config.projectPath}`)
        }

        await expectProjectSnapshot(config.name, 'page.wxml', wxml)
      }

      await page.waitFor(1000)
    }

    await miniProgram.close()
    await wait()
  })
})
