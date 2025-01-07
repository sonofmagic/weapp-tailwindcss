import { logger } from '../logger'

export async function getAstGrep() {
  try {
    const mod = await import('@ast-grep/napi')
    return mod
  }
  catch (error) {
    logger.warn('请先安装 `@ast-grep/napi` , 安装完成后再尝试运行！')
    throw error
  }
}
