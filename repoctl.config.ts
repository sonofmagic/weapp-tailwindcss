import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    create: {
      defaultTemplate: 'tsdown',
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
