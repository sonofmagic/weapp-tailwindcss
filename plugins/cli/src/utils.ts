const cssMatcher = (file: string) => /.+\.(?:wx|ac|jx|tt|q|c)ss$/.test(file)
const htmlMatcher = (file: string) => /.+\.(?:(?:(?:wx|ax|jx|ks|tt|q)ml)|swan)$/.test(file)
const jsMatcher = (file: string) => {
  if (file.includes('node_modules')) {
    return false
  }
  return /.+\.[cm]?[jt]s?$/.test(file)
}

export { cssMatcher, htmlMatcher, jsMatcher }
