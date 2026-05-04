import { defineConfig } from 'tsdown'
import { createTsdownConfigs } from './tsdown.shared.mts'

export default defineConfig((options = {}) => createTsdownConfigs(options))
