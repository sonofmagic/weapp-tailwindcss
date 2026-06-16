import type { IArbitraryValues } from '@/types/shared'
import { extractSourceCandidates } from 'tailwindcss-patch'
import { traverse } from '@/babel'
import { babelParse } from '@/js/babel'

const SCRIPT_SOURCE_CANDIDATE_EXTENSIONS = new Set([
  'js',
  'jsx',
  'mjs',
  'cjs',
  'ts',
  'tsx',
  'mts',
  'cts',
])

interface ScriptCandidateExtractionOptions {
  bareArbitraryValues?: IArbitraryValues['bareArbitraryValues'] | undefined
  extractor?: ((source: string, extension: string) => Promise<Iterable<string>> | Iterable<string>) | undefined
}

export async function extractScriptStringCandidates(
  source: string,
  extension: string,
  options: ScriptCandidateExtractionOptions,
) {
  if (!SCRIPT_SOURCE_CANDIDATE_EXTENSIONS.has(extension)) {
    return []
  }

  const values = new Set<string>()
  try {
    const ast = babelParse(source, {
      cache: true,
      cacheKey: `vite-source-candidates:${extension}`,
      plugins: ['jsx', 'typescript'],
      sourceType: 'unambiguous',
    })

    traverse(ast, {
      noScope: true,
      StringLiteral(path: any) {
        values.add(path.node.value)
      },
      TemplateElement(path: any) {
        values.add(path.node.value.raw)
      },
    } as any)
  }
  catch {
    return []
  }

  const candidates = new Set<string>()
  for (const value of values) {
    const extractedCandidates = options.extractor
      ? await options.extractor(value, 'html')
      : await extractSourceCandidates(value, 'html', {
          ...(options.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: options.bareArbitraryValues }),
        })
    for (const candidate of extractedCandidates) {
      candidates.add(candidate)
    }
  }
  return candidates
}
