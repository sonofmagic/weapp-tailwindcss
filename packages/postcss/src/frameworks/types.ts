import type { Result } from 'postcss'
import type { PostcssAppType } from '../branches'
import type { PostcssStyleTarget } from '../style-targets'
import type { IStyleHandlerOptions } from '../types'

export type PostcssFrameworkType = PostcssAppType | 'generic'

export interface ResolvePostcssFrameworkOptions extends Pick<
  IStyleHandlerOptions,
  'platform' | 'uniAppX' | 'uniAppXCssTarget'
> {
  appType?: PostcssAppType | undefined
}

export interface PostcssFrameworkStrategy {
  framework: PostcssFrameworkType
  resolveStyleTarget: (options: ResolvePostcssFrameworkOptions) => PostcssStyleTarget
}

export interface PostcssFrameworkProfile {
  framework: PostcssFrameworkType
  target: PostcssStyleTarget
  branch: PostcssStyleTarget
  postprocess: (result: Result, options: IStyleHandlerOptions) => Result
}
