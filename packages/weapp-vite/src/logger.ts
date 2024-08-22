import logger from '@weapp-core/logger'

export default logger

export type LogType = 'error' | 'warn' | 'info'
export type LogLevel = LogType | 'silent'
