import process from 'node:process'

const baseEnvKeys = [
  'WEAPP_TAILWINDCSS_BASEDIR',
  'WEAPP_TAILWINDCSS_BASE_DIR',
  'TAILWINDCSS_BASEDIR',
  'TAILWINDCSS_BASE_DIR',
  'UNI_INPUT_DIR',
  'UNI_INPUT_ROOT',
  'UNI_CLI_ROOT',
  'UNI_APP_INPUT_DIR',
] as const

function clearBaseEnv() {
  for (const key of baseEnvKeys) {
    delete process.env[key]
  }
}

export function setupEnvSandbox() {
  const originalPWD = process.env.PWD
  const originalInitCwd = process.env.INIT_CWD
  const originalEnvValues = new Map<string, string | undefined>(baseEnvKeys.map(key => [key, process.env[key]]))

  function restore() {
    clearBaseEnv()
    if (originalPWD !== undefined) {
      process.env.PWD = originalPWD
    }
    else {
      delete process.env.PWD
    }
    if (originalInitCwd !== undefined) {
      process.env.INIT_CWD = originalInitCwd
    }
    else {
      delete process.env.INIT_CWD
    }
    for (const key of baseEnvKeys) {
      const value = originalEnvValues.get(key)
      if (value === undefined) {
        delete process.env[key]
      }
      else {
        process.env[key] = value
      }
    }
  }

  return {
    clearBaseEnv,
    restore,
  }
}
