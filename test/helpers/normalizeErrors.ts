function removeCWD(str: string) {
  const isWin = process.platform === 'win32'
  let cwd = process.cwd()

  if (isWin) {
    // eslint-disable-next-line no-param-reassign
    str = str.replaceAll('\\', '/')
    // eslint-disable-next-line no-param-reassign
    cwd = cwd.replaceAll('\\', '/')
  }

  return str.replaceAll(new RegExp(cwd, 'g'), '')
}

export default (errors: Error[]) => errors.map((error) => removeCWD(error.toString().split('\n').slice(0, 2).join('\n')))
