function resolveDemoGeneratorMode(fallback) {
  const mode = process.env.WEAPP_TW_GENERATOR_MODE
  if (mode === 'legacy') {
    return false
  }
  if (mode === 'generator') {
    return {
      mode: 'force',
      target: 'weapp',
    }
  }
  if (mode === 'auto') {
    return {
      mode: 'auto',
      target: 'weapp',
    }
  }
  return fallback
}

module.exports = {
  resolveDemoGeneratorMode,
}
