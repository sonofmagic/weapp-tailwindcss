import fs from 'node:fs'
import path from 'node:path'
import { ReadmeRender } from '@icebreakers/readme'
import { trim } from 'lodash'
import { collapse } from './collapse'
function load(filename: string) {
  return fs.readFileSync(path.resolve(__dirname, './fragment', filename + '.md'), 'utf8')
}
// https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax
const renderer = new ReadmeRender({
  templatePath: 'scripts/readme/T.md'
})

const tableData = [
  // ['配置项', '类型', '描述'],
  ['`htmlMatcher`', '`((assetPath:string)=>boolean)`\\|`string`\\|`string[]`', '匹配 `wxml`等等模板进行处理的方法'],
  ['`cssMatcher`', '`((assetPath:string)=>boolean)`\\|`string`\\|`string[]`', '匹配 `wxss`等等样式文件的方法'],
  ['`jsMatcher`', '`((assetPath:string)=>boolean)`\\|`string`\\|`string[]`', '匹配 `js`文件进行处理的方法，用于`jsx`相关模板'],

  ['`mainCssChunkMatcher`', '`(assetPath:string)=>boolean`', '匹配 `tailwindcss jit` 生成的核心 `css chunk` 的方法'],
  // ['framework (`Taro` 特有)', '`react`\\|`vue2`\\|`vue3`', '由于 `Taro` 不同框架的编译结果有所不同，需要显式声明框架类型 默认`react`'],
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
  [
    '`customAttributes`',
    '`Record<string, string | Regexp | (string | Regexp)[]>`',
    [
      '**这是一个重要的配置!**',
      '它可以自定义`wxml`标签上的`attr`转化属性。默认转化所有的`class`和`hover-class`，这个`Map`的 `key`为匹配标签，`value`为属性字符串或者匹配正则数组。如果你想要增加转化的属性，你可以添加 `*`: `(string | Regexp)[]` 这样的键值对，使其中属性的转化，在所有标签上生效，更复杂的情况，可以传一个Map实例。',
      '假如你要把 `className` 通过组件的prop传递给子组件，又或者想要自定义转化的标签属性时，需要用到此配置，案例详见：[issue#134](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/134) [issue#129](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/129)'
    ].join('\n\n')
  ],
  [
    '`customReplaceDictionary`',
    "`'simple' | 'complex' | Record<string, string>`",
    [
      [
        "默认为 `'complex'` 模式，这个配置项，用来自定义转化`class`名称字典,你可以使用这个选项来简化生成的`class`",
        [
          "插件中内置了`'simple'`模式和`'complex'`模式:",
          "- `'simple'`模式: 把小程序中不允许的字符串，转义为**相等长度**的代替字符串，这种情况不追求转化目标字符串的一比一绝对等价，即无法从生成结果，反推原先的`class`",
          "- `'complex'`模式: 把小程序中不允许的字符串，转义为**更长**的代替字符串，这种情况转化前后的字符串是等价的，可以从结果进行反推，缺点就是会生成更长的 `class` 导致 `wxml`和`wxss`这类的体积增大"
        ].join('\n'),
        '当然，你也可以自定义，传一个 `Record<string, string>` 类型，只需保证转化后 css 中的 `class` 选择器，不会和自己定义的 `class` 产生冲突即可，示例见[dic.ts](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/src/dic.ts)'
      ].join('\n\n')
    ].join(',')
  ],
  ['`minifiedJs`', '`boolean`', "是否压缩生成的js文件内容，默认使用环境变量判断: `process.env.NODE_ENV === 'production'`"],
  [
    'mangle (2.3.0+)',
    '`boolean` \\| `IMangleOptions`',
    '是否压缩混淆 `wxml`,`js` 和 `wxss` 中指定范围的 `class` 以避免选择器过长问题，默认为`false`不开启，详细配置见 [unplugin-tailwindcss-mangle](https://github.com/sonofmagic/tailwindcss-mangle/tree/main/packages/unplugin-tailwindcss-mangle)'
  ],
  [
    '`cssPreflight`',
    '`Record<string,string>`\\| `false`',
    '在所有 `view`节点添加的 `css` 预设，可根据情况自由的禁用原先的规则，或者添加新的规则。 详细用法如下:\n' +
      `\`\`\`js
// default 默认:
cssPreflight: {
  'box-sizing': 'border-box',
  'border-width': '0',
  'border-style': 'solid',
  'border-color': 'currentColor'
}
// result
// box-sizing: border-box;
// border-width: 0;
// border-style: solid;
// border-color: currentColor

// case 禁用所有
cssPreflight: false
// result
// none

// case 禁用单个属性
cssPreflight: {
  'box-sizing': false
}
// border-width: 0;
// border-style: solid;
// border-color: currentColor

// case 更改和添加单个属性
cssPreflight: {
  'box-sizing': 'content-box',
  'background': 'black'
}
// result
// box-sizing: content-box;
// border-width: 0;
// border-style: solid;
// border-color: currentColor;
// background: black
\`\`\`
`
  ],
  [
    '`supportCustomLengthUnitsPatch`',
    '`ILengthUnitsPatchOptions` \\| `boolean`',
    '自从`tailwindcss 3.2.0`对任意值添加了长度单位的校验后，小程序中的`rpx`这个`wxss`单位，由于不在长度合法名单中，于是被识别成了颜色，导致与预期不符，详见：[issues/110](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110)。所以这个选项是用来给`tailwindcss`运行时，自动打上一个支持`rpx`单位的补丁。默认开启，在绝大部分情况下，你都可以忽略这个配置项，除非你需要更高级的自定义。' +
      '\n> 目前自动检索存在一定的缺陷，它会在第一次运行的时候不生效，关闭后第二次运行才生效。这是因为 nodejs 运行时先加载好了 `tailwindcss` 模块 ，然后再来运行这个插件，自动给 `tailwindcss` 运行时打上 `patch`。此时由于 `tailwindcss` 模块已经加载，所以 `patch` 在第一次运行时不生效，`ctrl+c` 关闭之后，再次运行才生效。这种情况可以使用:\n' +
      `\`\`\`json
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
\`\`\`
` +
      '\n使用 `npm hooks` 的方式来给 `tailwindcss` 自动打 `patch`'
  ]
]

renderer.write([
  [
    /{{options-table}}/,
    tableData
      .map(([o, t, d], idx) => {
        return ['### ' + trim(o, '`') + '\n', `类型: ${t}  `, '描述: ' + d].join('\n')
      })
      .join('\n\n')
    // markdownTable(tableData, {
    //   alignDelimiters: false
    // })
  ],
  [
    /{{install-tailwindcss}}/,
    collapse({
      summary: '安装 tailwindcss',
      body: load('install-tailwindcss')
    })
  ],
  [
    /{{rem2rpx}}/,
    collapse({
      summary: '配置tailwindcss单位转化',
      body: load('rem2rpx')
    })
  ],
  [
    /{{frameworks}}/,
    [
      collapse({
        summary: 'uni-app (vue2/3)',
        body: load('uni-app')
      }),
      collapse({
        summary: 'uni-app vite(vue3)',
        body: load('uni-app-vite')
      }),
      collapse({
        summary: 'Taro v3 (all frameworks)',
        body: load('taro')
      }),
      collapse({
        summary: 'mpx (原生增强)',
        body: load('mpx')
      }),
      collapse({
        summary: 'rax (react)',
        body: load('rax')
      }),
      collapse({
        summary: '原生开发 (webpack5/gulp)',
        body: load('native')
      })
    ].join('\n\n')
  ]
])
