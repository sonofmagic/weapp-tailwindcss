import { parseBenchmarkArgs } from '../src/args'
import { writeMarkdownReport } from '../src/report'
import { runBenchmark } from '../src/runner'

const options = parseBenchmarkArgs(process.argv.slice(2))
const report = await runBenchmark(options)
await writeMarkdownReport(options.out, options.report)

const failed = report.results.filter(result => result.error)
console.log(`Benchmark JSON written to ${options.out}`)
console.log(`Benchmark report written to ${options.report}`)
console.log(`Completed ${report.results.length} cases${failed.length > 0 ? `, ${failed.length} failed` : ''}`)
