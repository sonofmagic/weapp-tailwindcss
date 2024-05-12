// refers link: https://github.com/tailwindlabs/tailwindcss/blob/master/src/lib/regex.js

export const validateFilterRE = /[\w%-?\u00A0-\uFFFF-]/

export function isValidSelector(selector = ''): selector is string {
  return validateFilterRE.test(selector)
}

// export const splitCode = (code: string) => [...new Set(code.split(/\\?[\s'"`;={}]+/g))].filter(isValidSelector)

export function splitCode(code: string, allowDoubleQuotes = false) {
  // , onlyWhiteSpace?: boolean
  // const regex = onlyWhiteSpace ? /[\s]+/ : /"|[\s]+/
  // default /\s+/
  // for vue static node
  // |class="
  const splitter = allowDoubleQuotes ? /\s+/ : /\s+|"/
  return code.split(splitter).filter(element => isValidSelector(element))
}
