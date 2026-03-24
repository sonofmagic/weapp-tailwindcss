import type { Plugin } from 'vite'
import type { DebugManifest, DebugMetaEntry, DebugOptions, DebugStage, DebugWriteType, MatchRule } from '..'
import { expectAssignable, expectType } from 'tsd'
import { debugX } from '..'

const stage: DebugStage = 'pre'
expectAssignable<DebugStage>(stage)

const writeType: DebugWriteType = 'transform'
expectAssignable<DebugWriteType>(writeType)

const stringRule: MatchRule = 'App.uvue'
const regexpRule: MatchRule = /App/u
const fnRule: MatchRule = (id: string) => id.endsWith('.uvue')
expectAssignable<MatchRule>(stringRule)
expectAssignable<MatchRule>(regexpRule)
expectAssignable<MatchRule>(fnRule)

const entry: DebugMetaEntry = {
  file: 'pre/App.uvue',
  id: '/abs/App.uvue',
  stage: 'pre',
  type: 'transform',
}
expectAssignable<DebugMetaEntry>(entry)

const manifest: DebugManifest = {
  pre: [entry],
  normal: [],
  post: [],
  'bundle-pre': [],
  'bundle-normal': [],
  'bundle-post': [],
}
expectAssignable<DebugManifest>(manifest)

const options: DebugOptions = {
  cwd: '.',
  log: true,
  enabled: true,
  targetDir: '.debug',
  stages: ['pre', 'post'],
  include: ['App.uvue', /page/u, (id: string) => id.includes('node_modules')],
  exclude: [/vendor/u],
  skipPlatforms: ['app-ios'],
  onError: (_error: unknown, context: { stage: DebugStage, type: DebugWriteType, id: string }) => {
    expectType<DebugStage>(context.stage)
    expectType<DebugWriteType>(context.type)
    expectType<string>(context.id)
  },
}

expectAssignable<DebugOptions>(options)
expectType<Plugin[]>(debugX())
expectType<Plugin[]>(debugX(options))
