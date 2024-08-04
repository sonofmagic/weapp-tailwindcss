import fs from 'fs-extra'

import {
  defaultCustomConfigDirPath,
  defaultCustomConfigFilePath,
  defaultPath,
} from './defaults'

import type { IBaseConfig } from './types'

export async function createCustomConfig(params: IBaseConfig) {
  const isExisted = await fs.exists(defaultCustomConfigDirPath)
  if (!isExisted) {
    await fs.mkdir(defaultCustomConfigDirPath, { recursive: true })
  }
  await fs.writeFile(
    defaultCustomConfigFilePath,
    JSON.stringify(
      {
        cliPath: params.cliPath,
      },
      null,
      2,
    ),
    {
      encoding: 'utf8',
    },
  )
}
export async function getConfig(): Promise<IBaseConfig> {
  const isExisted = await fs.exists(defaultCustomConfigFilePath)
  if (isExisted) {
    const content = await fs.readFile(defaultCustomConfigFilePath, {
      encoding: 'utf8',
    })
    const config = JSON.parse(content)
    console.log('> 自定义cli路径：', config.cliPath)
    return config
  }
  else {
    return {
      cliPath: defaultPath,
    }
  }
}
