// refers link: https://github.com/tailwindlabs/tailwindcss/blob/master/src/lib/regex.js

export const validateFilterRE = /[\w%-?\u00A0-\uFFFF-]/

export function isValidSelector(selector = ''): selector is string {
  return validateFilterRE.test(selector)
}

// export const splitCode = (code: string) => [...new Set(code.split(/\\?[\s'"`;={}]+/g))].filter(isValidSelector)

export const splitCode = (code: string) => {
  // , onlyWhiteSpace?: boolean
  // const regex = onlyWhiteSpace ? /[\s]+/ : /"|[\s]+/
  // default /\s+/
  // for vue static node
  // |class="
  return code.split(/\s+|"/).filter((element) => isValidSelector(element))
}
