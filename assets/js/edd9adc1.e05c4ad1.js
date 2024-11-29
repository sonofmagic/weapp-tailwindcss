"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[7278],{8065:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>o,contentTitle:()=>d,default:()=>p,frontMatter:()=>t,metadata:()=>s,toc:()=>a});const s=JSON.parse('{"id":"quick-start/frameworks/taro","title":"Taro (\u6240\u6709\u6846\u67b6)","description":"\u76ee\u524d Taro v4 \u540c\u65f6\u652f\u6301\u4e86 Webpack \u548c Vite \u8fdb\u884c\u6253\u5305\u7f16\u8bd1\uff0cweapp-tailwindcss \u8fd9 2 \u8005\u90fd\u652f\u6301\uff0c\u4f46\u662f\u914d\u7f6e\u6709\u4e9b\u8bb8\u7684\u4e0d\u540c","source":"@site/docs/quick-start/frameworks/taro.md","sourceDirName":"quick-start/frameworks","slug":"/quick-start/frameworks/taro","permalink":"/weapp-tailwindcss/docs/quick-start/frameworks/taro","draft":false,"unlisted":false,"editUrl":"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/frameworks/taro.md","tags":[],"version":"current","frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"uni-app HbuilderX \u4f7f\u7528\u65b9\u5f0f","permalink":"/weapp-tailwindcss/docs/quick-start/frameworks/hbuilderx"},"next":{"title":"Rax (react)","permalink":"/weapp-tailwindcss/docs/quick-start/frameworks/rax"}}');var c=i(6106),r=i(2036);const t={},d="Taro (\u6240\u6709\u6846\u67b6)",o={},a=[{value:"\u4f7f\u7528 Webpack \u4f5c\u4e3a\u6253\u5305\u5de5\u5177",id:"\u4f7f\u7528-webpack-\u4f5c\u4e3a\u6253\u5305\u5de5\u5177",level:2},{value:"\u6ce8\u518c\u63d2\u4ef6",id:"\u6ce8\u518c\u63d2\u4ef6",level:3},{value:"\u4f7f\u7528 Vite \u4f5c\u4e3a\u6253\u5305\u5de5\u5177",id:"\u4f7f\u7528-vite-\u4f5c\u4e3a\u6253\u5305\u5de5\u5177",level:2},{value:"\u5728 <code>config/index.ts</code> \u4e2d\u6ce8\u518c\u63d2\u4ef6",id:"\u5728-configindexts-\u4e2d\u6ce8\u518c\u63d2\u4ef6",level:3},{value:"\u89c6\u9891\u6f14\u793a",id:"\u89c6\u9891\u6f14\u793a",level:2}];function l(e){const n={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",iframe:"iframe",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(n.header,{children:(0,c.jsx)(n.h1,{id:"taro-\u6240\u6709\u6846\u67b6",children:"Taro (\u6240\u6709\u6846\u67b6)"})}),"\n",(0,c.jsxs)(n.p,{children:["\u76ee\u524d Taro v4 \u540c\u65f6\u652f\u6301\u4e86 ",(0,c.jsx)(n.code,{children:"Webpack"})," \u548c ",(0,c.jsx)(n.code,{children:"Vite"})," \u8fdb\u884c\u6253\u5305\u7f16\u8bd1\uff0c",(0,c.jsx)(n.code,{children:"weapp-tailwindcss"})," \u8fd9 ",(0,c.jsx)(n.code,{children:"2"})," \u8005\u90fd\u652f\u6301\uff0c\u4f46\u662f\u914d\u7f6e\u6709\u4e9b\u8bb8\u7684\u4e0d\u540c"]}),"\n",(0,c.jsxs)(n.admonition,{type:"caution",children:[(0,c.jsxs)(n.p,{children:["\u5047\u5982\u4f60\u5199\u4e86 ",(0,c.jsx)(n.code,{children:"tailwindcss"})," \u5de5\u5177\u7c7b\u4e0d\u751f\u6548\uff0c\u53ef\u80fd\u662f\u7531\u4e8e\u5fae\u4fe1\u5f00\u53d1\u8005\u5de5\u5177\u9ed8\u8ba4\u5f00\u542f\u4e86 ",(0,c.jsx)(n.code,{children:"\u4ee3\u7801\u81ea\u52a8\u70ed\u91cd\u8f7d"})," \u529f\u80fd\uff0c\u5173\u95ed\u5b83\u5373\u53ef\u751f\u6548\u3002"]}),(0,c.jsxs)(n.p,{children:["\u5047\u5982\u4f60\u548c ",(0,c.jsx)(n.code,{children:"NutUI"})," \u4e00\u8d77\u4f7f\u7528\uff0c\u8bf7\u4e00\u5b9a\u8981\u67e5\u770b\u8fd9\u4e2a",(0,c.jsx)(n.a,{href:"/docs/issues/use-with-nutui",children:"\u6ce8\u610f\u4e8b\u9879"}),"!"]})]}),"\n",(0,c.jsxs)(n.p,{children:["\u4e0b\u5217\u914d\u7f6e\u540c\u65f6\u652f\u6301 ",(0,c.jsx)(n.code,{children:"taro"})," \u7684 ",(0,c.jsx)(n.code,{children:"react"})," / ",(0,c.jsx)(n.code,{children:"preact"})," / ",(0,c.jsx)(n.code,{children:"vue2"})," / ",(0,c.jsx)(n.code,{children:"vue3"})," \u6240\u6709\u6846\u67b6"]}),"\n",(0,c.jsx)(n.h2,{id:"\u4f7f\u7528-webpack-\u4f5c\u4e3a\u6253\u5305\u5de5\u5177",children:"\u4f7f\u7528 Webpack \u4f5c\u4e3a\u6253\u5305\u5de5\u5177"}),"\n",(0,c.jsx)(n.h3,{id:"\u6ce8\u518c\u63d2\u4ef6",children:"\u6ce8\u518c\u63d2\u4ef6"}),"\n",(0,c.jsxs)(n.p,{children:["\u5728\u9879\u76ee\u7684\u914d\u7f6e\u6587\u4ef6 ",(0,c.jsx)(n.code,{children:"config/index"})," \u4e2d\u6ce8\u518c:"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-js",metastring:'title="config/index.[jt]s"',children:"const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')\n// \u5047\u5982\u4f60\u4f7f\u7528 ts \u914d\u7f6e\uff0c\u5219\u4f7f\u7528\u4e0b\u65b9 import \u7684\u5199\u6cd5\n// import { UnifiedWebpackPluginV5 } from 'weapp-tailwindcss/webpack'\n\n{\n  // \u627e\u5230 mini \u8fd9\u4e2a\u914d\u7f6e\n  mini: {\n    // postcss: { /*...*/ },\n    // \u4e2d\u7684 webpackChain, \u901a\u5e38\u7d27\u6328\u7740 postcss \n    webpackChain(chain, webpack) {\n      // \u590d\u5236\u8fd9\u5757\u533a\u57df\u5230\u4f60\u7684\u914d\u7f6e\u4ee3\u7801\u4e2d region start\n      // highlight-start\n      chain.merge({\n        plugin: {\n          install: {\n            plugin: UnifiedWebpackPluginV5,\n            args: [{\n              appType: 'taro'\n            }]\n          }\n        }\n      })\n      // highlight-end\n      // region end\n    }\n  }\n}\n"})}),"\n",(0,c.jsxs)(n.p,{children:["\u7136\u540e\u6b63\u5e38\u8fd0\u884c\u9879\u76ee\u5373\u53ef\uff0c\u76f8\u5173\u7684\u914d\u7f6e\u53ef\u4ee5\u53c2\u8003\u6a21\u677f ",(0,c.jsx)(n.a,{href:"https://github.com/sonofmagic/taro-react-tailwind-vscode-template",children:"taro-react-tailwind-vscode-template"})]}),"\n",(0,c.jsxs)(n.admonition,{type:"info",children:[(0,c.jsxs)(n.p,{children:[(0,c.jsx)(n.code,{children:"weapp-tailwindcss/webpack"})," \u5bf9\u5e94\u7684\u63d2\u4ef6 ",(0,c.jsx)(n.code,{children:"UnifiedWebpackPluginV5"})," \u5bf9\u5e94 ",(0,c.jsx)(n.code,{children:"webpack@5"})]}),(0,c.jsxs)(n.p,{children:[(0,c.jsx)(n.code,{children:"weapp-tailwindcss/webpack4"})," \u5bf9\u5e94\u7684\u63d2\u4ef6 ",(0,c.jsx)(n.code,{children:"UnifiedWebpackPluginV4"})," \u5bf9\u5e94 ",(0,c.jsx)(n.code,{children:"webpack@4"})]}),(0,c.jsxs)(n.p,{children:["\u5728\u4f7f\u7528 ",(0,c.jsx)(n.code,{children:"Taro"})," \u65f6\uff0c\u68c0\u67e5\u4e00\u4e0b ",(0,c.jsx)(n.code,{children:"config/index"})," \u6587\u4ef6\u7684\u914d\u7f6e\u9879 ",(0,c.jsx)(n.code,{children:"compiler"}),"\uff0c\u6765\u786e\u8ba4\u4f60\u7684 ",(0,c.jsx)(n.code,{children:"webpack"})," \u7248\u672c\uff0c\u63a8\u8350\u4f7f\u7528 ",(0,c.jsx)(n.code,{children:"'webpack5'"})]}),(0,c.jsxs)(n.p,{children:["\u53e6\u5916\u5047\u5982\u4f60\u4f7f\u7528\u4e86 ",(0,c.jsx)(n.a,{href:"https://www.npmjs.com/package/taro-plugin-compiler-optimization",children:(0,c.jsx)(n.code,{children:"taro-plugin-compiler-optimization"})})," \u8bb0\u5f97\u628a\u5b83\u5e72\u6389\u3002\u56e0\u4e3a\u548c\u5b83\u4e00\u8d77\u4f7f\u7528\u65f6\uff0c\u5b83\u4f1a\u4f7f\u6574\u4e2a\u6253\u5305\u7ed3\u679c\u53d8\u5f97\u6df7\u4e71\u3002\u8be6\u89c1 ",(0,c.jsx)(n.a,{href:"https://github.com/sonofmagic/weapp-tailwindcss/issues/123",children:"issues/123"})," ",(0,c.jsx)(n.a,{href:"https://github.com/sonofmagic/weapp-tailwindcss/issues/131",children:"issues/131"})]}),(0,c.jsxs)(n.p,{children:["\u8fd8\u6709 ",(0,c.jsx)(n.code,{children:"taro"})," \u7684 ",(0,c.jsx)(n.code,{children:"prebundle"})," \u529f\u80fd\u8001\u662f\u51fa\u9519\uff0c\u6700\u8fd1\u66f4\u65b0\u4e4b\u540e\uff0c\u7531\u4e8e ",(0,c.jsx)(n.code,{children:"prebundle"})," \u9ed8\u8ba4\u5f00\u542f\uff0c\u6709\u65f6\u5019\u8fde ",(0,c.jsx)(n.code,{children:"taro cli"})," \u521d\u59cb\u5316\u7684\u6a21\u677f\u9879\u76ee\u90fd\u8dd1\u4e0d\u8d77\u6765\uff0c\u5047\u5982\u9047\u5230\u95ee\u9898\u627e\u4e0d\u5230\u539f\u56e0\uff0c\u53ef\u4ee5\u5c1d\u8bd5\u5173\u95ed\u8fd9\u4e2a\u914d\u7f6e\u3002"]})]}),"\n",(0,c.jsx)(n.h2,{id:"\u4f7f\u7528-vite-\u4f5c\u4e3a\u6253\u5305\u5de5\u5177",children:"\u4f7f\u7528 Vite \u4f5c\u4e3a\u6253\u5305\u5de5\u5177"}),"\n",(0,c.jsxs)(n.admonition,{type:"danger",children:[(0,c.jsx)(n.p,{children:"Taro Vite \u76ee\u524d\u5b58\u5728\u4e00\u4e9b bug \u8fd8\u6ca1\u6709\u4fee\u590d\uff0c\u4e0d\u63a8\u8350\u4f7f\u7528!"}),(0,c.jsx)(n.p,{children:"\u4e0b\u65b9\u6ce8\u518c\u65b9\u5f0f\u4f1a\u5b58\u5728\u90e8\u5206\u6837\u5f0f\u4e22\u5931\u7684\u60c5\u51b5"})]}),"\n",(0,c.jsxs)(n.p,{children:["\u7531\u4e8e ",(0,c.jsx)(n.code,{children:"taro@4"})," \u7684 ",(0,c.jsx)(n.code,{children:"vite"})," \u7248\u672c\uff0c\u76ee\u524d\u52a0\u8f7d ",(0,c.jsx)(n.code,{children:"postcss.config.js"})," \u914d\u7f6e\u662f\u5931\u6548\u7684\uff0c\u6240\u4ee5\u6211\u4eec\u76ee\u524d\u6682\u65f6\u53ea\u80fd\u4f7f\u7528\u5185\u8054 ",(0,c.jsx)(n.code,{children:"postcss"})," \u63d2\u4ef6\u7684\u5199\u6cd5"]}),"\n",(0,c.jsxs)(n.h3,{id:"\u5728-configindexts-\u4e2d\u6ce8\u518c\u63d2\u4ef6",children:["\u5728 ",(0,c.jsx)(n.code,{children:"config/index.ts"})," \u4e2d\u6ce8\u518c\u63d2\u4ef6"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-ts",metastring:'title="config/index.[jt]s"',children:"import type { Plugin } from 'vite'\nimport tailwindcss from 'tailwindcss'\nimport { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'\n\nconst baseConfig: UserConfigExport<'vite'> = {\n  // ... \u5176\u4ed6\u914d\u7f6e\n  // highlight-start\n  compiler: {\n    type: 'vite',\n    vitePlugins: [\n      {\n        // \u901a\u8fc7 vite \u63d2\u4ef6\u52a0\u8f7d postcss,\n        name: 'postcss-config-loader-plugin',\n        config(config) {\n          // \u52a0\u8f7d tailwindcss\n          if (typeof config.css?.postcss === 'object') {\n            config.css?.postcss.plugins?.unshift(tailwindcss())\n          }\n        },\n      },\n      uvtw({\n        // rem\u8f6crpx\n        rem2rpx: true,\n        // \u9664\u4e86\u5c0f\u7a0b\u5e8f\u8fd9\u4e9b\uff0c\u5176\u4ed6\u5e73\u53f0\u90fd disable\n        disabled: process.env.TARO_ENV === 'h5' || process.env.TARO_ENV === 'harmony' || process.env.TARO_ENV === 'rn'\n      })\n    ] as Plugin[] // \u4ece vite \u5f15\u5165 type, \u4e3a\u4e86\u667a\u80fd\u63d0\u793a\n  },\n  // highlight-end\n  // ... \u5176\u4ed6\u914d\u7f6e\n}\n"})}),"\n",(0,c.jsxs)(n.p,{children:[(0,c.jsx)(n.code,{children:"tailwindcss"})," \u5373\u53ef\u6ce8\u518c\u6210\u529f\uff0c\u6b63\u5e38\u4f7f\u7528\u4e86"]}),"\n",(0,c.jsxs)(n.p,{children:["\u8fd9\u6bb5\u4ee3\u7801\u7684\u610f\u601d\u4e3a\uff0c\u5728 ",(0,c.jsx)(n.code,{children:"vite"})," \u91cc\u6ce8\u518c ",(0,c.jsx)(n.code,{children:"postcss"})," \u63d2\u4ef6\u548c ",(0,c.jsx)(n.code,{children:"vite"})," \u63d2\u4ef6"]}),"\n",(0,c.jsxs)(n.blockquote,{children:["\n",(0,c.jsxs)(n.p,{children:[(0,c.jsx)(n.code,{children:"vite.config.ts"})," \u53ea\u6709\u5728\u8fd0\u884c\u5c0f\u7a0b\u5e8f\u7684\u65f6\u5019\u624d\u4f1a\u52a0\u8f7d\uff0c",(0,c.jsx)(n.code,{children:"h5"})," \u4e0d\u4f1a\uff0c\u6240\u4ee5\u53ea\u80fd\u901a\u8fc7\u8fd9\u79cd\u65b9\u5f0f\u8fdb\u884c ",(0,c.jsx)(n.code,{children:"\u5c0f\u7a0b\u5e8f"})," + ",(0,c.jsx)(n.code,{children:"h5"})," \u53cc\u7aef\u517c\u5bb9"]}),"\n"]}),"\n",(0,c.jsx)(n.h2,{id:"\u89c6\u9891\u6f14\u793a",children:"\u89c6\u9891\u6f14\u793a"}),"\n",(0,c.jsx)(n.iframe,{src:"//player.bilibili.com/player.html?aid=966499437&bvid=BV1UW4y1w7VM&cid=1411385502&p=1&autoplay=0",scrolling:"no",border:"0",frameBorder:"no",framespacing:"0",allowFullScreen:"true",children:" "})]})}function p(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(l,{...e})}):l(e)}},2036:(e,n,i)=>{i.d(n,{R:()=>t,x:()=>d});var s=i(7378);const c={},r=s.createContext(c);function t(e){const n=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:t(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);