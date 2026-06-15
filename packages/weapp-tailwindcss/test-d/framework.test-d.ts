import type { DetectableAppType } from 'weapp-tailwindcss/framework'
import { expectType } from 'tsd'
import {
  detectAppType,
  detectAppTypeFromEnv,
  detectAppTypeFromPackageJson,
  isMpxPackage,
  isRunningInHBuilderX,
  isUniAppXPackage,
  resolveUniPlatformsFromEnv,
  resolveUniUtsPlatform,
} from 'weapp-tailwindcss/framework'

expectType<DetectableAppType | undefined>(detectAppType())
expectType<DetectableAppType | undefined>(detectAppTypeFromEnv({ UNI_PLATFORM: 'h5' }))
expectType<DetectableAppType | undefined>(detectAppTypeFromPackageJson({ dependencies: { '@tarojs/runtime': '^4.0.0' } }))
expectType<boolean>(isMpxPackage({ scripts: { dev: 'mpx-cli-service serve' } }))
expectType<boolean>(isUniAppXPackage({ devDependencies: { '@dcloudio/uni-uts-v1': '^3.0.0' } }))
expectType<boolean>(isRunningInHBuilderX({ cwd: '/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite' }))
expectType<boolean>(resolveUniUtsPlatform('app-ios').isAppIos)
expectType<boolean>(resolveUniPlatformsFromEnv({ UNI_PLATFORM: 'h5' }).uniPlatform.isWeb)
