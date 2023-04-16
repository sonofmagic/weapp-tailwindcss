export const validateFilterRE = /[\w\u00A0-\uFFFF-_:%-?]/

export function isValidSelector(selector = ''): selector is string {
  return validateFilterRE.test(selector)
}

// export const splitCode = (code: string) => [...new Set(code.split(/\\?[\s'"`;={}]+/g))].filter(isValidSelector)

export const splitCode = (code: string) => code.split(/\s+/).filter(isValidSelector)
