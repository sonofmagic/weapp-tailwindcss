import { describe, expect, it } from 'vitest'
import {
  cliEntries,
  createTsupConfigs,
  runtimeEntries,
} from '../../tsup.shared'

describe('tsup build layout', () => {
  it('separates cli entry from runtime entries to avoid shared chunk pollution', () => {
    const configs = createTsupConfigs()
    const runtimeConfig = configs[0]
    const cliConfig = configs[1]

    expect(runtimeConfig.entry).toEqual(runtimeEntries)
    expect(runtimeConfig.splitting).toBe(true)
    expect(runtimeConfig.entry).not.toHaveProperty('cli')

    expect(cliConfig.entry).toEqual(cliEntries)
    expect(cliConfig.splitting).toBe(false)
    expect(Object.keys(cliConfig.entry)).toEqual(['cli'])
  })

  it('keeps runtime config as the only cleanable build during non-watch runs', () => {
    const configs = createTsupConfigs()

    expect(configs[0].clean).toBe(true)
    expect(configs.slice(1).every(config => config.clean === false)).toBe(true)
  })

  it('disables clean across all builds in watch mode', () => {
    const configs = createTsupConfigs({ watch: true })

    expect(configs.every(config => config.clean === false)).toBe(true)
  })
})
