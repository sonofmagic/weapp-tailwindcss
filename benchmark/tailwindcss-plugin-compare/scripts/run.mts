import { parseBenchmarkArgs } from '../src/args'
import { runBenchmark } from '../src/runner'

const options = parseBenchmarkArgs(process.argv.slice(2))
const report = await runBenchmark(options)

console.log(`Benchmark JSON written to ${options.out}`)
console.log(`Completed ${report.results.length} cases`)
