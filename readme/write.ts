import { markdownTable, ReadmeRender } from '@icebreakers/readme'

const renderer = new ReadmeRender({
  templatePath: './readme/T.md'
})

renderer.write([
  [
    /{{options-table}}/,
    markdownTable(
      [
        ['配置项', '类型', '描述'],
        ['`htmlMatcher`', '`(assetPath:string)=>boolean`\\|`string`\\|`string[]`', '匹配 `wxml`等等模板进行处理的方法'],
        ['`cssMatcher`', '`(assetPath:string)=>boolean`\\|`string`\\|`string[]`', '匹配 `wxss`等等样式文件的方法'],
        ['`jsMatcher`', '`(assetPath:string)=>boolean`\\|`string`\\|`string[]`', '匹配 `js`文件进行处理的方法，用于`jsx`相关模板'],

        ['`mainCssChunkMatcher`', '`(assetPath:string)=>boolean`', '匹配 `tailwindcss jit` 生成的核心 `css chunk` 的方法'],
        ['`framework` (`Taro` 特有)', '`react`\\|`vue2`\\|`vue3`', '由于 `Taro` 不同框架的编译结果有所不同，需要显式声明框架类型 默认`react`'],
        ['`customRuleCallback`', '`(node: Postcss.Rule, options: Readonly<RequiredStyleHandlerOptions>) => void`', '可根据 Postcss walk 自由定制处理方案的 callback 方法 '],
        ['`disabled`', '`boolean`', '是否禁用该插件，默认为 `false`，一般用于多平台构建，有些平台比如 `h5` 不需要开启此插件，所以可以根据环境变量进行禁用。'],
        [
          '`cssPreflightRange`',
          "`'view'` \\| `'all'`",
          "全局`dom`选择器，只有在这个选择器作用范围内的`dom`会被注入 `cssPreflight` 的变量和默认样式。默认为 `'view'` 即只对所有的 `view` 和伪元素生效，想要对所有的元素生效，可切换为 `'all'`,此时需要自行处理和客户端默认样式的冲突"
        ],
        [
          '`replaceUniversalSelectorWith`',
          '`string` \\| `false`',
          "把`css`中的全局选择器 **`*`** 替换为指定值，默认替换为 `'view'`，设置为 `false` 时不进行替换，此时小程序会由于不认识`*`选择器而报错"
        ],
        ['`customAttributes`', '`Record<string, string | string[]>`', '自定义`wxml`标签上的`attr`转化属性，默认转化所有的`class`和`hover-class`'],
        ['`customReplaceDictionary`', '`Record<string, string>`', '自定义转化`class`名称字典,你可以使用这个选项来简化生成的`class`'],
        // [
        //   '`mangle`(1.9.0+)',
        //   '`boolean` \\| `IMangleOptions`',
        //   '是否压缩混淆 `wxml` 和 `wxss` 中指定范围的 `class` 以避免选择器过长问题，默认为`false`不开启，详细配置见 [mangle.md](./docs/mangle.md)'
        // ],
        ['`cssPreflight`', '`Record<string,string>`\\| `false`', '在所有 `view`节点添加的 `css` 预设，可根据情况自由的禁用原先的规则，或者添加新的规则。 详细用法如下:']
      ],
      {
        alignDelimiters: false
      }
    )
  ]
])
