import fs from 'fs-extra'

const cssMatcher = (file: string) => /.+\.(?:wx|ac|jx|tt|q|c)ss$/.test(file)
const htmlMatcher = (file: string) => /.+\.(?:(?:(?:wx|ax|jx|ks|tt|q)ml)|swan)$/.test(file)
const jsMatcher = (file: string) => {
  if (file.includes('node_modules')) {
    return false
  }
  return /.+\.[cm]?[jt]s?$/.test(file)
}

export { cssMatcher, htmlMatcher, jsMatcher }

export function touch(filename: string) {
  const time = new Date()

  try {
    fs.utimesSync(filename, time, time)
  } catch {
    fs.closeSync(fs.openSync(filename, 'w'))
  }
}

export { default as set } from 'set-value'
export { default as get } from 'get-value'
