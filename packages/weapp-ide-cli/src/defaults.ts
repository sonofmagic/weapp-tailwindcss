import path from 'node:path'
import os from 'node:os'

const homedir = os.homedir()
const SupportedPlatformsMap = {
  Windows_NT: 'Windows_NT',
  Darwin: 'Darwin',
}

const defaultPathMap = {
  [SupportedPlatformsMap.Windows_NT]:
    'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
  [SupportedPlatformsMap.Darwin]:
    '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
} as Record<string, string>
export const operatingSystemName = os.type()

export const defaultCustomConfigDirPath = path.join(homedir, '.weapp-ide-cli')
export const defaultCustomConfigFilePath = path.join(
  defaultCustomConfigDirPath,
  'config.json',
)

export const defaultPath = defaultPathMap[operatingSystemName]
