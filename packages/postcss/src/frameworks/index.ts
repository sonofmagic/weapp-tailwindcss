import type { PostcssStyleTargetProfile } from '../style-targets'
import type {
  PostcssFrameworkProfile,
  PostcssFrameworkStrategy,
  ResolvePostcssFrameworkOptions,
} from './types'
import { createPostcssStyleTargetProfile } from '../style-targets'
import { genericPostcssFrameworkStrategy } from './generic'
import { kbonePostcssFrameworkStrategy } from './kbone'
import { mpxPostcssFrameworkStrategy } from './mpx'
import { nativePostcssFrameworkStrategy } from './native'
import { remaxPostcssFrameworkStrategy } from './remax'
import { taroPostcssFrameworkStrategy } from './taro'
import { uniAppPostcssFrameworkStrategy } from './uni-app'
import { uniAppVitePostcssFrameworkStrategy } from './uni-app-vite'
import { uniAppXPostcssFrameworkStrategy } from './uni-app-x'
import { weappVitePostcssFrameworkStrategy } from './weapp-vite'

function isUniAppXFramework(options: ResolvePostcssFrameworkOptions) {
  if (options.uniAppX === false) {
    return false
  }
  return options.uniAppX === true || options.appType === 'uni-app-x'
}

export function resolvePostcssFrameworkStrategy(options: ResolvePostcssFrameworkOptions): PostcssFrameworkStrategy {
  if (isUniAppXFramework(options)) {
    return uniAppXPostcssFrameworkStrategy
  }

  switch (options.appType) {
    case 'kbone':
      return kbonePostcssFrameworkStrategy
    case 'mpx':
      return mpxPostcssFrameworkStrategy
    case 'native':
      return nativePostcssFrameworkStrategy
    case 'remax':
      return remaxPostcssFrameworkStrategy
    case 'taro':
      return taroPostcssFrameworkStrategy
    case 'uni-app':
      return uniAppPostcssFrameworkStrategy
    case 'uni-app-vite':
      return uniAppVitePostcssFrameworkStrategy
    case 'weapp-vite':
      return weappVitePostcssFrameworkStrategy
    case 'uni-app-x':
    default:
      return genericPostcssFrameworkStrategy
  }
}

export function resolvePostcssFrameworkProfile(options: ResolvePostcssFrameworkOptions): PostcssFrameworkProfile {
  const strategy = resolvePostcssFrameworkStrategy(options)
  const target = strategy.resolveStyleTarget(options)
  const targetProfile: PostcssStyleTargetProfile = createPostcssStyleTargetProfile(target)

  return {
    framework: strategy.framework,
    target,
    branch: target,
    postprocess: targetProfile.postprocess,
  }
}

export function resolvePostcssStyleTarget(options: ResolvePostcssFrameworkOptions) {
  return resolvePostcssFrameworkProfile(options).target
}

export type {
  PostcssFrameworkProfile,
  PostcssFrameworkStrategy,
  PostcssFrameworkType,
  ResolvePostcssFrameworkOptions,
} from './types'
