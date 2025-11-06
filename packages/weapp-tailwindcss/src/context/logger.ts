import { logger } from '@weapp-tailwindcss/logger'

// 参考：https://www.npmjs.com/package/consola
const loggerLevelMap: Record<'info' | 'warn' | 'error' | 'silent', number> = {
  error: 0,
  warn: 1,
  info: 3,
  silent: -999,
}

export type LoggerLevel = keyof typeof loggerLevelMap

export function applyLoggerLevel(logLevel?: LoggerLevel): void {
  logger.level = loggerLevelMap[logLevel ?? 'info'] ?? loggerLevelMap.info
}
