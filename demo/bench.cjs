const path = require('node:path')
const fs = require('fs-extra')
const dayjs = require('dayjs')
const { set, get } = require('lodash')

const useBabel = process.env.BABEL

console.log('useBabel:', Boolean(useBabel))

class Bench {
  constructor(name) {
    this.name = name
    this.startTs = 0
    this.endTs = 0
    this.warned = false
  }

  start() {
    this.startTs = performance.now()
  }

  end() {
    this.endTs = performance.now()
  }

  timeSpan() {
    return this.endTs - this.startTs
  }

  get useBabel() {
    return Boolean(useBabel)
  }

  dump(key = 'babel') {
    const ts = this.timeSpan()
    const filename = dayjs().format('YYYY-MM-DD') + '.json'
    const targetDataFile = path.resolve(__dirname, '../benchmark/app/data', filename)
    const targetDir = path.dirname(targetDataFile)
    try {
      fs.ensureDirSync(targetDir)
      if (fs.existsSync(targetDataFile)) {
        const json = fs.readJsonSync(targetDataFile)
        const arr = get(json, [this.name, key], [])
        arr.push(ts)
        set(json, [this.name, key], arr)
        fs.writeJSONSync(targetDataFile, json, { spaces: 2 })
      }
      else {
        fs.writeJSONSync(
          targetDataFile,
          {
            [this.name]: {
              [key]: [ts],
            },
          },
          { spaces: 2 },
        )
      }
    }
    catch (error) {
      if (!this.warned) {
        this.warned = true
        console.warn('[bench] skip writing metrics:', error.message)
      }
    }
  }
}

module.exports = function createBench(name) {
  return new Bench(name)
}
