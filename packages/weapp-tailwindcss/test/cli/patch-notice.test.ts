import { describe, expect, it, vi } from 'vitest'
import {
  logPatchCommandGeneratorModeNotice,
  PATCH_COMMAND_GENERATOR_MODE_NOTICE,
} from '../../src/cli/mount-options'
import { logger } from '../../src/logger'

vi.mock('../../src/logger', () => ({
  logger: {
    warn: vi.fn(),
  },
}))

describe('cli patch notice', () => {
  it('tells v5 generator users that postinstall patch is no longer required', () => {
    logPatchCommandGeneratorModeNotice()

    expect(logger.warn).toHaveBeenCalledWith(PATCH_COMMAND_GENERATOR_MODE_NOTICE)
    expect(PATCH_COMMAND_GENERATOR_MODE_NOTICE).toContain('weapp-tailwindcss@5')
    expect(PATCH_COMMAND_GENERATOR_MODE_NOTICE).toContain('postinstall')
  })
})
