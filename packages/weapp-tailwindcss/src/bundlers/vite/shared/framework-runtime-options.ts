export function sameStringList(first?: readonly string[], second?: readonly string[]) {
  if (first === second) {
    return true
  }
  if (!first || !second || first.length !== second.length) {
    return false
  }
  return first.every((item, index) => item === second[index])
}
