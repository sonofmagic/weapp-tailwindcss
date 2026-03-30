const path = require('node:path')
const fs = require('fs-extra')
const { set, get } = require('lodash')

const useBabel = process.env.BABEL

console.log('useBabel:', Boolean(useBabel))

const defaultRepoDataDir = path.resolve(__dirname, '../benchmark/app/data')
const defaultLocalDataDir = path.resolve(__dirname, '../.tmp/benchmark-app/data')

function resolveBenchOutputDir() {
  if (process.env.WEAPP_TW_BENCH_OUTPUT_DIR) {
    return path.resolve(process.cwd(), process.env.WEAPP_TW_BENCH_OUTPUT_DIR)
  }

  if (process.env.WEAPP_TW_BENCH_WRITE_REPO_DATA === '1') {
    return defaultRepoDataDir
  }

  return defaultLocalDataDir
}

function formatBenchDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

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
    const filename = `${formatBenchDate()}.json`
    const targetDataFile = path.join(resolveBenchOutputDir(), filename)
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
module.exports.resolveBenchOutputDir = resolveBenchOutputDir
