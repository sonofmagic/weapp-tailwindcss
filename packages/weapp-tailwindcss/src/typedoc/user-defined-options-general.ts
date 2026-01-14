import type { ParserOptions } from '@babel/parser'
import type { LoadedPostcssOptions } from '@weapp-tailwindcss/postcss'
import type { ILengthUnitsPatchOptions, TailwindcssPatchOptions } from 'tailwindcss-patch'
import type { ICreateCacheReturnType } from '../cache'
import type { AppType, IArbitraryValues } from '../types'

declare module '../typedoc.export' {
  // 3.一般配置
  export interface UserDefinedOptions {

    /**
     * 控制 Tailwind 自定义长度单位补丁。
     *
     * @group 3.一般配置
     * @see https://github.com/sonofmagic/weapp-tailwindcss/issues/110
     * @remarks
     * TailwindCSS 3.2.0 起对任意值执行长度单位校验，会将未声明的 `rpx` 识别为颜色。本选项默认开启以注入 `rpx` 支持。当 Node.js 在插件执行前已缓存 `tailwindcss` 模块时，首轮运行可能未生效，可通过在 `postinstall` 中执行 `weapp-tw patch` 提前打补丁。
     * ```diff
     * "scripts": {
     * +  "postinstall": "weapp-tw patch"
     * }
     * ```
     */
    supportCustomLengthUnitsPatch?: ILengthUnitsPatchOptions | boolean

    /**
     * 声明所使用的框架类型。
     *
     * @group 3.一般配置
     * @remarks
     * 用于辅助定位主要的 CSS bundle，以便默认的 `mainCssChunkMatcher` 做出更准确的匹配，未传入时将尝试自动猜测变量注入位置。
     */
    appType?: AppType

    /**
     * TailwindCSS 任意值的相关配置。
     *
     * @group 3.一般配置
     */
    arbitraryValues?: IArbitraryValues

    /**
     * 控制 JS 字面量是否需要保留。
     *
     * @group 3.一般配置
     * @since ^2.6.1
     * @remarks
     * 当 Tailwind 与 JS 字面量冲突时，可通过回调返回 `true` 保留当前值，返回 `false` 或 `undefined` 则继续转义。默认保留所有带 `*` 的字符串字面量。
     */
    jsPreserveClass?: (keyword: string) => boolean | undefined

    /**
     * 是否替换运行时依赖包名。
     *
     * @group 3.一般配置
     * @remarks
     * 适用于运行时包名需要重定向的场景，例如：
     * - 小程序侧无法直接安装 `tailwind-merge`/`class-variance-authority`/`tailwind-variants`，需要替换为内置的 weapp 版本。
     * - 企业内私有镜像/多包发布导致运行时包名不同，希望在转换后统一到目标包名。
     * 传入 `true` 使用内置替换表，或传入对象自定义映射。
     * @example
     * ```ts
     * replaceRuntimePackages: {
     *   'tailwind-merge': '@weapp-tailwindcss/merge',
     *   'class-variance-authority': '@weapp-tailwindcss/cva',
     * }
     * ```
     */
    replaceRuntimePackages?: boolean | Record<string, string>

    /**
     * 禁用默认的 `wxml` 模板替换器。
     *
     * @group 3.一般配置
     * @since ^2.6.2
     * @remarks
     * 启用后模板匹配完全交由 [`customAttributes`](/docs/api/interfaces/UserDefinedOptions#customattributes) 管理，需要自行覆盖默认的 `class` / `hover-class` 等匹配规则。
     * @default false
     */
    disabledDefaultTemplateHandler?: boolean

    /**
     * 内部使用的运行时加载器路径。
     *
     * @ignore
     * @internal
     */
    runtimeLoaderPath?: string

    /**
     * 内部使用的 CSS import 重写加载器路径。
     *
     * @ignore
     * @internal
     */
    runtimeCssImportRewriteLoaderPath?: string

    /**
     * 指定用于获取 Tailwind 上下文的路径。
     *
     * @group 3.一般配置
     * @since ^2.9.3
     * @remarks
     * 在 linked 或 monorepo 场景下可手动指向目标项目的 `package.json` 所在目录。
     */
    tailwindcssBasedir?: string

    /**
     * 控制缓存策略。
     *
     * @group 3.一般配置
     * @since ^3.0.11
     */
    cache?: boolean | ICreateCacheReturnType

    /**
     * `@babel/parser` 的配置选项。
     *
     * @since ^3.2.0
     * @group 3.一般配置
     */
    babelParserOptions?: ParserOptions & { cache?: boolean, cacheKey?: string }

    /**
     * 自定义 Tailwind 子组合器的替换值。
     *
     * @group 3.一般配置
     * @remarks
     * 为兼容小程序缺乏 `:not([hidden])~` 支持的限制，默认会将 `.space-x-4` 等选择器替换为 `view + view`。可传入字符串或字符串数组以扩展适用标签。
     * ```css
     * // 数组示例
     * .space-y-4>view + view,text + text{}
     *
     * // 字符串示例
     * .space-y-4>view,text,button,input ~ view,text,button,input{}
     * ```
     * @default 'view + view'
     */
    cssChildCombinatorReplaceValue?: string | string[]

    /**
     * `postcss` 的配置选项。
     *
     * @since ^3.2.0
     * @group 3.一般配置
     */
    postcssOptions?: LoadedPostcssOptions
    /**
     * 是否移除 CSS 中的 `:hover` 选择器。
     *
     * @since ^3.2.1
     * @group 3.一般配置
     * @see https://github.com/sonofmagic/weapp-tailwindcss/issues/293
     * @remarks
     * 小程序不支持 `:hover`，需要使用组件的 `hover-class`，因此默认删除相关节点。
     * @default `true`
     */
    cssRemoveHoverPseudoClass?: boolean
    /**
     * 是否移除 `@property` 节点。
     *
     * @since ^4.1.2
     * @group 3.一般配置
     * @remarks
     * 微信小程序可识别 `@property`，但支付宝暂不支持，默认移除以避免构建失败。
     * @default `true`
     */
    cssRemoveProperty?: boolean

    /**
     * 自定义 patcher 参数。
     *
     * @group 3.一般配置
     */
    tailwindcssPatcherOptions?: TailwindcssPatchOptions
    /**
     * 控制命令行日志输出级别。
     *
     * @group 3.一般配置
     * @remarks
     * 默认 `info`，可设置为 `silent` 屏蔽全部输出。
     */
    logLevel?: 'info' | 'warn' | 'error' | 'silent'
  }
}
