export default class GlobsSet {
  includeSet: Set<string>
  excludeSet: Set<string>
  constructor() {
    this.includeSet = new Set<string>()
    this.excludeSet = new Set<string>()
  }

  isExcludeGlob(value: string) {
    return value[0] === '!'
  }

  addSingle(value: string) {
    return this.isExcludeGlob(value) ? this.excludeSet.add(value) : this.includeSet.add(value)
  }

  add(...value: string[] | string[][]) {
    for (const v of value) {
      if (Array.isArray(v)) {
        for (const vv of v) {
          this.addSingle(vv)
        }
      }
      else {
        this.addSingle(v)
      }
    }
  }

  dump() {
    return [...this.includeSet, ...this.excludeSet]
  }

  dumpIgnored() {
    return [...this.excludeSet].map(x => x.slice(1))
  }
}
