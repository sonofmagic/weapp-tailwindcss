export function isWebpackCssLoaderRuntimeSource(source: string) {
  return source.includes('___CSS_LOADER_EXPORT___')
    && source.includes('___CSS_LOADER_API_IMPORT___')
    && source.includes('module.exports = ___CSS_LOADER_EXPORT___')
}
