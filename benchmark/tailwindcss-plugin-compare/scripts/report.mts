import { parseReportArgs } from '../src/args'
import { writeMarkdownReport } from '../src/report'

const options = parseReportArgs(process.argv.slice(2))
await writeMarkdownReport(options.input, options.report)

console.log(`Benchmark report written to ${options.report}`)
