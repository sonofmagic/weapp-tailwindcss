const HTTP_PATTERN = /^https?:\/\//i

export function isHttp(target: string) {
  return HTTP_PATTERN.test(target)
}
