import process from 'node:process'
import mm from 'micromatch'
import { defu } from '@weapp-core/shared'
import path from 'pathe'
import klaw from 'klaw'
import { defaultExcluded, getWxmlEntry, searchAppEntry } from './utils'
import type { Entry } from './types'

export function createFilter(include: string[], exclude: string[], options?: mm.Options) {
  const opts = defu<mm.Options, mm.Options[]>(options, {
    ignore: exclude,
    // dot: true,
    // contains: true,
  })
  return function (id: unknown | string) {
    if (typeof id !== 'string') {
      return false
    }
    if (/\0/.test(id)) {
      return false
    }

    return mm.isMatch(id as string, include, opts)
  }
}

export async function scanEntries(root: string, options: { relative?: boolean, srcRoot: string, outDir: string }) {
  const { outDir, srcRoot } = options

  function formatPath(to: string) {
    if (options?.relative) {
      return path.relative(root, to)
    }
    return path.normalize(to)
  }

  const appEntry = searchAppEntry(root, {
    formatPath,
  })

  // TODO exclude 需要和 output 配套
  // const walkPathsSet = new Set<string>()
  if (appEntry) {
    const subPackageDeps = appEntry.deps.filter(x => x.type === 'subPackage')
    const filter = createFilter(
      [path.join(srcRoot, '**/*')],
      [
        ...defaultExcluded,
        path.join(root, `${outDir}/**`),
        ...subPackageDeps.map((x) => {
          return path.join(root, `${x.root}/**`)
        }),
      ],
      { cwd: root },
    )

    const pageEntries: Entry[] = []
    const componentEntries: Entry[] = []

    for await (
      const file of klaw(
        root,
        {
          filter,
        },
      )
    ) {
      if (file.stats.isFile()) {
        if (/\.wxml$/.test(file.path)) {
          const entry = getWxmlEntry(file.path, formatPath)
          if (entry) {
            //  && !walkPathsSet.has(file.path)
            // 防止重复，理论上不会
            // walkPathsSet.add(file.path)
            if (entry.type === 'component') {
              componentEntries.push(entry)
            }
            else if (entry.type === 'page') {
              pageEntries.push(entry)
            }
          }
        }
      }
    }

    return {
      app: appEntry,
      pages: pageEntries,
      components: componentEntries,
      subPackages: [],
      // walkPathsSet,
    }
  }
}

export function getEntries(options: { root?: string, srcRoot?: string, outDir?: string, relative?: boolean }) {
  // build.outDir
  const { root = process.cwd(), outDir = 'dist', relative, srcRoot = '' } = options

  return scanEntries(root, { outDir, relative, srcRoot })
}
