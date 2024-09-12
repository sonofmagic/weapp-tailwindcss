import type { BaseConfig } from './types'
import fs from 'fs-extra'

import {
  defaultCustomConfigDirPath,
  defaultCustomConfigFilePath,
  defaultPath,
} from './defaults'

import logger from './logger'

export async function createCustomConfig(params: BaseConfig) {
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
export async function getConfig(): Promise<BaseConfig> {
  const isExisted = await fs.exists(defaultCustomConfigFilePath)
  if (isExisted) {
    const content = await fs.readFile(defaultCustomConfigFilePath, {
      encoding: 'utf8',
    })
    const config = JSON.parse(content)
    logger.log('> 全局配置文件路径：', defaultCustomConfigFilePath)
    logger.log('> 自定义cli路径：', config.cliPath)
    return config
  }
  else {
    return {
      cliPath: defaultPath,
    }
  }
}
