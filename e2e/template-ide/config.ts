import { readFile } from 'node:fs/promises'

interface PageConfig {
  usingComponents?: Record<string, string>
}

function parseConfig(source: string): PageConfig {
  const config = JSON.parse(source)
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('页面配置必须是 JSON 对象。')
  }
  return config
}

export async function readTemplatePageConfig(outputFile: string, nativeSourceFile?: string): Promise<PageConfig> {
  try {
    return parseConfig(await readFile(outputFile, 'utf8'))
  }
  catch (error) {
    // weapp-vite 不输出空原生页面配置；只有源码明确为空对象时才接受缺省产物。
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT' || !nativeSourceFile) {
      throw error
    }
    const source = parseConfig(await readFile(nativeSourceFile, 'utf8'))
    if (Object.keys(source).length > 0) {
      throw new Error(`非空页面配置缺少构建产物：${outputFile}`, { cause: error })
    }
    return source
  }
}
