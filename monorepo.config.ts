import { defineMonorepoConfig } from '@icebreakers/monorepo'

export default defineMonorepoConfig({
  commands: {
    create: {
      defaultTemplate: 'unbuild',
      renameJson: false,
    },
    clean: {
      autoConfirm: false,
      includePrivate: true,
    },
    sync: {
      concurrency: 4,
      command: 'cnpm sync {name}',
    },
    upgrade: {
      skipOverwrite: false,
      mergeTargets: true,
    },
  },
})
