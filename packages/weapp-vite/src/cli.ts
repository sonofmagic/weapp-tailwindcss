import process from 'node:process'
import { cac } from 'cac'
import colors from 'picocolors'
import { initConfig } from '@weapp-core/init'
import { parse } from 'weapp-ide-cli'
import path from 'pathe'
import fs from 'fs-extra'
import { runDev, runProd } from './build'
import type { LogLevel } from './logger'
import logger from './logger'
import { createContext } from './context'
import { VERSION } from './constants'

const cli = cac('weapp-vite')

interface GlobalCLIOptions {
  '--'?: string[]
  'c'?: boolean | string
  'config'?: string
  'base'?: string
  'l'?: LogLevel
  'logLevel'?: LogLevel
  'clearScreen'?: boolean
  'd'?: boolean | string
  'debug'?: boolean | string
  'f'?: string
  'filter'?: string
  'm'?: string
  'mode'?: string
  'force'?: boolean
}
// @ts-ignore
// eslint-disable-next-line no-restricted-globals
let profileSession = global.__vite_profile_session
let profileCount = 0

export function stopProfiler(log: (message: string) => void): void | Promise<void> {
  if (!profileSession) {
    return
  }
  return new Promise((res, rej) => {
    profileSession!.post('Profiler.stop', (err: any, { profile }: any) => {
      // Write profile to disk, upload, etc.
      if (!err) {
        const outPath = path.resolve(
          `./vite-profile-${profileCount++}.cpuprofile`,
        )
        fs.writeFileSync(outPath, JSON.stringify(profile))
        log(
          colors.yellow(
            `CPU profile written to ${colors.white(colors.dim(outPath))}`,
          ),
        )
        profileSession = undefined
        res()
      }
      else {
        rej(err)
      }
    })
  })
}

function filterDuplicateOptions<T extends object>(options: T) {
  for (const [key, value] of Object.entries(options)) {
    if (Array.isArray(value)) {
      options[key as keyof T] = value[value.length - 1]
    }
  }
}

function convertBase(v: any) {
  if (v === 0) {
    return ''
  }
  return v
}

cli
  .option('-c, --config <file>', `[string] use specified config file`)
  .option('--base <path>', `[string] public base path (default: /)`, {
    type: [convertBase],
  })
  .option('-l, --logLevel <level>', `[string] info | warn | error | silent`)
  .option('--clearScreen', `[boolean] allow/disable clear screen when logging`)
  .option('-d, --debug [feat]', `[string | boolean] show debug logs`)
  .option('-f, --filter <filter>', `[string] filter debug logs`)
  .option('-m, --mode <mode>', `[string] set env mode`)

cli
  .command('[root]', 'start dev server') // default command
  .alias('serve') // the command is called 'serve' in Vite's API
  .alias('dev') // alias to align with the script name
  .action(async (root: string, options: GlobalCLIOptions) => {
    filterDuplicateOptions(options)
    const ctx = createContext(root, {
      mode: options.mode,
    })
    ctx.isDev = true
    await runDev(ctx)
  })

cli
  .command('build [root]', 'build for production')
  .option('--target <target>', `[string] transpile target (default: 'modules')`)
  .option('--outDir <dir>', `[string] output directory (default: dist)`)
  .option(
    '--sourcemap [output]',
    `[boolean | "inline" | "hidden"] output source maps for build (default: false)`,
  )
  .option(
    '--minify [minifier]',
    `[boolean | "terser" | "esbuild"] enable/disable minification, `
    + `or specify minifier to use (default: esbuild)`,
  )
  .option(
    '--emptyOutDir',
    `[boolean] force empty outDir when it's outside of root`,
  )
  .option('-w, --watch', `[boolean] rebuilds when modules have changed on disk`)
  .action(async (root: string, options) => {
    filterDuplicateOptions(options)
    const ctx = createContext(root, {
      mode: options.mode,
    })
    await runProd(ctx)
  })

cli
  .command('init').action(() => {
    try {
      initConfig({
        command: 'weapp-vite',
      })
    }
    catch (error) {
      logger.error(error)
    }
    finally {
      process.exit()
    }
  })

cli
  .command('open').action(async () => {
    try {
      await parse(['open', '-p'])
    }
    catch (error) {
      logger.error(error)
    }
    finally {
      process.exit()
    }
  })

cli
  .command('npm').alias('build:npm').alias('build-npm').action(async () => {
    try {
      await parse(['build-npm', '-p'])
    }
    catch (error) {
      logger.error(error)
    }
    finally {
      process.exit()
    }
  })

cli.help()
cli.version(VERSION)
cli.parse()
