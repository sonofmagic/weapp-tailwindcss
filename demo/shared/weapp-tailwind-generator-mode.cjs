function resolveDemoGeneratorMode(fallback) {
  const mode = process.env.WEAPP_TW_GENERATOR_MODE
  const fallbackObject = typeof fallback === 'object' && fallback !== null ? fallback : {}
  if (mode === 'legacy') {
    return false
  }
  if (mode === 'generator') {
    return {
      ...fallbackObject,
      mode: 'force',
      target: 'weapp',
    }
  }
  if (mode === 'auto') {
    return {
      ...fallbackObject,
      mode: 'auto',
      target: 'weapp',
    }
  }
  return {
    ...fallbackObject,
    mode: 'force',
    target: 'weapp',
  }
}

module.exports = {
  resolveDemoGeneratorMode,
}
