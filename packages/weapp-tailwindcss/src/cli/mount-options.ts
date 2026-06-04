import type {
  TailwindcssPatchCliMountOptions,
  TailwindcssPatchCommand,
  TailwindcssPatchCommandHandler,
} from 'tailwindcss-patch'
import process from 'node:process'
import { logger } from '@/logger'

export const PATCH_COMMAND_OBSOLETE_NOTICE
  = '提示：weapp-tailwindcss@5 已由构建运行时接管 Tailwind CSS 处理，weapp-tw patch 已无需执行；请移除 package.json 中的 postinstall 钩子。'

export function logPatchCommandObsoleteNotice() {
  logger.warn(PATCH_COMMAND_OBSOLETE_NOTICE)
}

function handleCliError(error: unknown) {
  if (error instanceof Error) {
    logger.error(error.message)
    if (error.stack && process.env['WEAPP_TW_DEBUG'] === '1') {
      logger.error(error.stack)
    }
  }
  else {
    logger.error(String(error))
  }
}

function withCommandErrorHandling<TCommand extends TailwindcssPatchCommand>(
  handler: TailwindcssPatchCommandHandler<TCommand>,
): TailwindcssPatchCommandHandler<TCommand> {
  return (async (ctx, next) => {
    try {
      return await handler(ctx, next)
    }
    catch (error) {
      handleCliError(error)
      process.exitCode = 1
      return undefined as ReturnType<TailwindcssPatchCommandHandler<TCommand>>
    }
  }) as TailwindcssPatchCommandHandler<TCommand>
}

const forwardedCommands = ['extract', 'tokens', 'init', 'migrate', 'restore', 'validate'] as const
const commandHandlers = Object.fromEntries(
  forwardedCommands.map(command => [
    command,
    withCommandErrorHandling<typeof command>(async (_ctx, next) => next()),
  ]),
) as unknown as NonNullable<TailwindcssPatchCliMountOptions['commandHandlers']>

export const mountOptions: TailwindcssPatchCliMountOptions = {
  commands: [...forwardedCommands],
  commandHandlers,
}
