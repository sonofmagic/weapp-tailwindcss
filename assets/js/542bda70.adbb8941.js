"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[5576],{9809:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>t,contentTitle:()=>r,default:()=>p,frontMatter:()=>l,metadata:()=>i,toc:()=>a});const i=JSON.parse('{"id":"quick-start/uni-app-css-macro","title":"uni-app \u6761\u4ef6\u7f16\u8bd1\u8bed\u6cd5\u7cd6\u63d2\u4ef6","description":"\u7248\u672c\u9700\u6c42 2.10.0+","source":"@site/docs/quick-start/uni-app-css-macro.md","sourceDirName":"quick-start","slug":"/quick-start/uni-app-css-macro","permalink":"/weapp-tailwindcss/docs/quick-start/uni-app-css-macro","draft":false,"unlisted":false,"editUrl":"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/uni-app-css-macro.md","tags":[],"version":"current","frontMatter":{},"sidebar":"communitySidebar","previous":{"title":"\u5c0f\u7a0b\u5e8f\u591a\u4e3b\u9898\u65b9\u6848","permalink":"/weapp-tailwindcss/docs/quick-start/apply-themes"},"next":{"title":"\u6784\u5efa\u4ee5\u53ca\u5f15\u5165\u5916\u90e8\u7ec4\u4ef6","permalink":"/weapp-tailwindcss/docs/quick-start/build-or-import-outside-components"}}');var c=s(7557),d=s(972);const l={},r="uni-app \u6761\u4ef6\u7f16\u8bd1\u8bed\u6cd5\u7cd6\u63d2\u4ef6",t={},a=[{value:"\u8fd9\u662f\u4ec0\u4e48\u73a9\u610f?",id:"\u8fd9\u662f\u4ec0\u4e48\u73a9\u610f",level:2},{value:"\u5982\u4f55\u4f7f\u7528",id:"\u5982\u4f55\u4f7f\u7528",level:2},{value:"tailwind.config.js \u6ce8\u518c",id:"tailwindconfigjs-\u6ce8\u518c",level:3},{value:"postcss \u63d2\u4ef6\u6ce8\u518c",id:"postcss-\u63d2\u4ef6\u6ce8\u518c",level:3},{value:"uni-app vite vue3",id:"uni-app-vite-vue3",level:4},{value:"uni-app vue2",id:"uni-app-vue2",level:4},{value:"\u914d\u7f6e\u5b8c\u6210",id:"\u914d\u7f6e\u5b8c\u6210",level:3},{value:"\u914d\u7f6e\u9879",id:"\u914d\u7f6e\u9879",level:2},{value:"IDE\u667a\u80fd\u63d0\u793a",id:"ide\u667a\u80fd\u63d0\u793a",level:2},{value:"\u52a8\u6001\u63d0\u793a: ifdef-[] \u548c ifndef-[]",id:"\u52a8\u6001\u63d0\u793a-ifdef--\u548c-ifndef-",level:3},{value:"\u914d\u7f6e\u7684\u9759\u6001\u63d0\u793a: wx \u548c -wx",id:"\u914d\u7f6e\u7684\u9759\u6001\u63d0\u793a-wx-\u548c--wx",level:3}];function o(e){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",img:"img",p:"p",pre:"pre",strong:"strong",...(0,d.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(n.header,{children:(0,c.jsx)(n.h1,{id:"uni-app-\u6761\u4ef6\u7f16\u8bd1\u8bed\u6cd5\u7cd6\u63d2\u4ef6",children:"uni-app \u6761\u4ef6\u7f16\u8bd1\u8bed\u6cd5\u7cd6\u63d2\u4ef6"})}),"\n",(0,c.jsxs)(n.blockquote,{children:["\n",(0,c.jsx)(n.p,{children:"\u7248\u672c\u9700\u6c42 2.10.0+"}),"\n"]}),"\n",(0,c.jsx)(n.h2,{id:"\u8fd9\u662f\u4ec0\u4e48\u73a9\u610f",children:"\u8fd9\u662f\u4ec0\u4e48\u73a9\u610f?"}),"\n",(0,c.jsxs)(n.p,{children:["\u5728 ",(0,c.jsx)(n.code,{children:"uni-app"})," \u91cc\uff0c\u5b58\u5728\u4e00\u79cd\u7c7b\u4f3c\u5b8f\u6307\u4ee4\u7684",(0,c.jsx)(n.a,{href:"https://uniapp.dcloud.net.cn/tutorial/platform.html#%E6%A0%B7%E5%BC%8F%E7%9A%84%E6%9D%A1%E4%BB%B6%E7%BC%96%E8%AF%91",children:"\u6837\u5f0f\u6761\u4ef6\u7f16\u8bd1\u5199\u6cd5"}),":"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-css",children:"/*  #ifdef  %PLATFORM%  */\n\u5e73\u53f0\u7279\u6709\u6837\u5f0f\n/*  #endif  */\n"})}),"\n",(0,c.jsxs)(n.blockquote,{children:["\n",(0,c.jsxs)(n.p,{children:["uni-app ",(0,c.jsx)(n.code,{children:"%PLATFORM%"})," \u7684\u6240\u6709\u53d6\u503c\u53ef\u4ee5\u53c2\u8003\u8fd9\u4e2a",(0,c.jsx)(n.a,{href:"https://uniapp.dcloud.net.cn/tutorial/platform.html#preprocessor",children:"\u94fe\u63a5"})]}),"\n"]}),"\n",(0,c.jsxs)(n.p,{children:["\u5728 ",(0,c.jsx)(n.code,{children:"weapp-tailwindcss@2.10.0+"})," \u7248\u672c\u4e2d\u5185\u7f6e\u4e86\u4e00\u4e2a ",(0,c.jsx)(n.code,{children:"css-macro"})," \u529f\u80fd\uff0c\u53ef\u4ee5\u8ba9\u4f60\u7684 ",(0,c.jsx)(n.code,{children:"tailwindcss"})," \u81ea\u52a8\u751f\u6210\u5e26\u6709\u6761\u4ef6\u7f16\u8bd1\u7684\u6837\u5f0f\u4ee3\u7801\uff0c\u6765\u8f85\u52a9\u4f60\u8fdb\u884c\u591a\u5e73\u53f0\u7684\u9002\u914d\u5f00\u53d1\uff0c\u6548\u679c\u7c7b\u4f3c\u5982\u4e0b\u65b9\u5f0f:"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-html",children:'\x3c!-- \u9ed8\u8ba4 --\x3e\n<view class="ifdef-[H5||MP-WEIXIN]:bg-blue-400">Web\u548c\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u5e73\u53f0\u84dd\u8272\u80cc\u666f</view>\n<view class="ifndef-[MP-WEIXIN]:bg-red-500">\u975eMP-WEIXIN\u5e73\u53f0\u7ea2\u8272\u80cc\u666f</view>\n<view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500">\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u4e3a\u84dd\u8272\uff0c\u4e0d\u662f\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u4e3a\u7ea2\u8272<view>\n\x3c!-- \u81ea\u5b9a\u4e49 --\x3e\n<view class="wx:bg-blue-400 -wx:bg-red-400">\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u4e3a\u84dd\u8272\uff0c\u4e0d\u662f\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u4e3a\u7ea2\u8272</view>\n<view class="tt:bg-blue-400">\u5934\u6761\u5c0f\u7a0b\u5e8f\u84dd\u8272</view>\n'})}),"\n",(0,c.jsx)(n.p,{children:"\u6216\u8005\u8fd9\u6837\u7684\u6761\u4ef6\u6837\u5f0f\u4ee3\u7801:"}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-css",children:"/*\u53ea\u5728 H5 \u548c MP-WEIXIN, \u80cc\u666f\u4e3a\u84dd\u8272\uff0c\u5426\u5219\u4e3a\u7ea2\u8272 */\n.apply-test-0 {\n  @apply ifdef-[H5||MP-WEIXIN]:bg-blue-400 ifndef-[H5||MP-WEIXIN]:bg-red-400;\n}\n/* \u81ea\u5b9a\u4e49 */\n.apply-test-1 {\n  @apply mv:bg-blue-400 -mv:bg-red-400 wx:text-blue-400 -wx:text-red-400;\n}\n"})}),"\n",(0,c.jsx)(n.p,{children:"\u8ba9\u6211\u4eec\u770b\u770b\u5982\u4f55\u4f7f\u7528\u5427\uff01"}),"\n",(0,c.jsx)(n.h2,{id:"\u5982\u4f55\u4f7f\u7528",children:"\u5982\u4f55\u4f7f\u7528"}),"\n",(0,c.jsxs)(n.p,{children:["\u8fd9\u91cc\u9700\u8981\u540c\u65f6\u914d\u7f6e ",(0,c.jsx)(n.code,{children:"tailwindcss"})," \u548c ",(0,c.jsx)(n.code,{children:"postcss"})," \u7684\u914d\u7f6e\u6587\u4ef6\u624d\u80fd\u8d77\u4f5c\u7528\uff0c\u5176\u4e2d ",(0,c.jsx)(n.code,{children:"tailwindcss"})," \u914d\u7f6e\u4fee\u6539\u7684\u65b9\u5f0f\u5927\u4f53\u7c7b\u4f3c\uff0c ",(0,c.jsx)(n.code,{children:"uni-app"})," ",(0,c.jsx)(n.code,{children:"vue2/3"})," ",(0,c.jsx)(n.code,{children:"postcss"}),"\u63d2\u4ef6\u7684\u6ce8\u518c\u65b9\u5f0f\uff0c\u6709\u4e9b\u8bb8\u4e0d\u540c:"]}),"\n",(0,c.jsx)(n.h3,{id:"tailwindconfigjs-\u6ce8\u518c",children:"tailwind.config.js \u6ce8\u518c"}),"\n",(0,c.jsxs)(n.p,{children:["\u9996\u5148\u5728\u4f60\u7684 ",(0,c.jsx)(n.code,{children:"tailwind.config.js"})," \u6ce8\u518c\u63d2\u4ef6 ",(0,c.jsx)(n.code,{children:"cssMacro"}),":"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-js",children:"const cssMacro = require('weapp-tailwindcss/css-macro');\n/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  // ...\n  plugins: [\n    /* \u8fd9\u91cc\u53ef\u4ee5\u4f20\u5165\u914d\u7f6e\u9879\uff0c\u9ed8\u8ba4\u53ea\u5305\u62ec ifdef \u548c ifndef */\n    cssMacro(),\n  ],\n};\n"})}),"\n",(0,c.jsx)(n.h3,{id:"postcss-\u63d2\u4ef6\u6ce8\u518c",children:"postcss \u63d2\u4ef6\u6ce8\u518c"}),"\n",(0,c.jsxs)(n.p,{children:["\u5bf9\u5e94\u7684 ",(0,c.jsx)(n.code,{children:"postcss"})," \u63d2\u4ef6\u4f4d\u7f6e\u4e3a ",(0,c.jsx)(n.code,{children:"weapp-tailwindcss/css-macro/postcss"})]}),"\n",(0,c.jsxs)(n.p,{children:["\u503c\u5f97\u6ce8\u610f\u7684\u662f\uff0c\u4f60\u5fc5\u987b\u628a\u8fd9\u4e2a\u63d2\u4ef6\uff0c\u6ce8\u518c\u5728 ",(0,c.jsx)(n.code,{children:"tailwindcss"})," \u4e4b\u540e\u548c ",(0,c.jsx)(n.code,{children:"@dcloudio/vue-cli-plugin-uni/packages/postcss"})," \u4e4b\u524d\u3002"]}),"\n",(0,c.jsxs)(n.blockquote,{children:["\n",(0,c.jsxs)(n.p,{children:[(0,c.jsx)(n.code,{children:"@dcloudio/vue-cli-plugin-uni/packages/postcss"})," \u4e3a vue2 cli\u9879\u76ee\u7279\u6709\uff0cvue3\u4e0d\u7528\u7ba1\u3002"]}),"\n"]}),"\n",(0,c.jsxs)(n.p,{children:["\u6ce8\u518c\u5728 ",(0,c.jsx)(n.code,{children:"tailwindcss"})," \u4e4b\u540e\u5f88\u597d\u7406\u89e3\uff0c\u6211\u4eec\u5728\u9488\u5bf9 ",(0,c.jsx)(n.code,{children:"tailwindcss"})," \u7684\u4ea7\u7269\u505a\u4fee\u6539\uff0c\u81ea\u7136\u8981\u5728\u5b83\u6267\u884c\u4e4b\u540e\u5904\u7406\uff0c\u6ce8\u518c\u5728 ",(0,c.jsx)(n.code,{children:"@dcloudio/vue-cli-plugin-uni/packages/postcss"})," \u4e4b\u524d\u5219\u662f\u56e0\u4e3a ",(0,c.jsx)(n.code,{children:"uni-app"})," \u6837\u5f0f\u7684\u6761\u4ef6\u7f16\u8bd1\uff0c\u9760\u7684\u5c31\u662f\u5b83\u3002\u5047\u5982\u5728\u5b83\u4e4b\u540e\u53bb\u5904\u7406\u4e0d\u4e45\u5df2\u7ecf\u592a\u665a\u4e86\u561b\u3002"]}),"\n",(0,c.jsxs)(n.blockquote,{children:["\n",(0,c.jsxs)(n.p,{children:["\u8fd9\u91cc\u63d0\u4e00\u4e0b postcss \u63d2\u4ef6\u7684\u6267\u884c\u987a\u5e8f\uff0c\u5047\u5982\u6ce8\u518c\u662f\u6570\u7ec4\uff0c\u90a3\u5c31\u662f\u6309\u7167\u987a\u5e8f\u6267\u884c\uff0c\u5982\u679c\u662f\u5bf9\u8c61\uff0c\u90a3\u5c31\u662f\u4ece\u4e0a\u5f80\u4e0b\u6267\u884c\uff0c\u8be6\u89c1",(0,c.jsx)(n.a,{href:"https://www.npmjs.com/package/postcss-load-config#ordering",children:"\u5b98\u65b9\u6587\u6863"})]}),"\n"]}),"\n",(0,c.jsx)(n.h4,{id:"uni-app-vite-vue3",children:"uni-app vite vue3"}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-diff",children:"// vite.config.ts \u6587\u4ef6\nimport { defineConfig } from 'vite';\n// postcss \u63d2\u4ef6\u914d\u7f6e\nconst postcssPlugins = [require('autoprefixer')(), require('tailwindcss')()];\n// ... \u5176\u4ed6\u7701\u7565\n+ postcssPlugins.push(require('weapp-tailwindcss/css-macro/postcss'));\n// https://vitejs.dev/config/\nexport default defineConfig({\n  plugins: vitePlugins,\n  css: {\n    postcss: {\n      plugins: postcssPlugins,\n    },\n  },\n});\n"})}),"\n",(0,c.jsxs)(n.blockquote,{children:["\n",(0,c.jsxs)(n.p,{children:["\u53ef\u4ee5\u53c2\u8003\u8fd9\u4e2a\u9879\u76ee\u7684\u914d\u7f6e ",(0,c.jsx)(n.a,{href:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo/uni-app-vue3-vite",children:"demo/uni-app-vue3-vite"})]}),"\n"]}),"\n",(0,c.jsx)(n.h4,{id:"uni-app-vue2",children:"uni-app vue2"}),"\n",(0,c.jsxs)(n.p,{children:["vue2 cli \u9879\u76ee\u9ed8\u8ba4\u4f1a\u5e26\u4e00\u4e2a ",(0,c.jsx)(n.code,{children:"postcss.config.js"})," \u6211\u4eec\u4e4b\u95f4\u76f4\u63a5\u5728\u91cc\u9762\u6ce8\u518c\u5373\u53ef:"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-diff",children:"const webpack = require('webpack')\nconst config = {\n  parser: require('postcss-comment'),\n  plugins: [\n    // ...\n    require('tailwindcss')({ config: './tailwind.config.js' }),\n    // ...\n+   require('weapp-tailwindcss/css-macro/postcss'),\n    require('autoprefixer')({\n      remove: process.env.UNI_PLATFORM !== 'h5'\n    }),\n+   // \u6ce8\u610f\u5728 tailwindcss \u4e4b\u540e\u548c \u8fd9\u4e2a\u4e4b\u524d\n    require('@dcloudio/vue-cli-plugin-uni/packages/postcss')\n  ]\n}\nif (webpack.version[0] > 4) {\n  delete config.parser\n}\nmodule.exports = config\n"})}),"\n",(0,c.jsxs)(n.blockquote,{children:["\n",(0,c.jsxs)(n.p,{children:["\u53ef\u4ee5\u53c2\u8003\u8fd9\u4e2a\u9879\u76ee\u7684\u914d\u7f6e ",(0,c.jsx)(n.a,{href:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo/uni-app",children:"demo/uni-app"})]}),"\n"]}),"\n",(0,c.jsx)(n.h3,{id:"\u914d\u7f6e\u5b8c\u6210",children:"\u914d\u7f6e\u5b8c\u6210"}),"\n",(0,c.jsxs)(n.p,{children:["\u73b0\u5728\u914d\u7f6e\u597d\u4e86\u8fd92\u4e2a\u5730\u65b9\uff0c\u76ee\u524d\u4f60\u5c31\u53ef\u4ee5\u76f4\u63a5\u4f7f\u7528 ",(0,c.jsx)(n.code,{children:"ifdef"})," \u548c ",(0,c.jsx)(n.code,{children:"ifndef"})," \u7684\u6761\u4ef6\u7f16\u8bd1\u5199\u6cd5\u4e86\uff01"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-html",children:'\x3c!-- \u9ed8\u8ba4 --\x3e\n<view class="ifdef-[H5||MP-WEIXIN]:bg-blue-400">Web\u548c\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u5e73\u53f0\u84dd\u8272\u80cc\u666f</view>\n<view class="ifndef-[MP-WEIXIN]:bg-red-500">\u975eMP-WEIXIN\u5e73\u53f0\u7ea2\u8272\u80cc\u666f</view>\n<view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500">\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u4e3a\u84dd\u8272\uff0c\u4e0d\u662f\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u4e3a\u7ea2\u8272<view>\n\x3c!-- \u81ea\u5b9a\u4e49 --\x3e\n<view class="wx:bg-blue-400 -wx:bg-red-400">\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u4e3a\u84dd\u8272\uff0c\u4e0d\u662f\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u4e3a\u7ea2\u8272</view>\n<view class="tt:bg-blue-400">\u5934\u6761\u5c0f\u7a0b\u5e8f\u84dd\u8272</view>\n'})}),"\n",(0,c.jsx)(n.p,{children:"\u4e0d\u8fc7\u4f60\u80af\u5b9a\u4f1a\u89c9\u5f97\u8fd9\u79cd\u9ed8\u8ba4\u5199\u6cd5\u5f88\u70e6\uff01\u8981\u5199\u5f88\u591a\uff0c\u4e0d\u8981\u7d27\uff0c\u6211\u8fd8\u4e3a\u4f60\u63d0\u4f9b\u4e86\u81ea\u5b9a\u4e49\u7684\u65b9\u5f0f\uff0c\u63a5\u4e0b\u6765\u6765\u770b\u770b\u914d\u7f6e\u9879\u5427\uff01"}),"\n",(0,c.jsx)(n.h2,{id:"\u914d\u7f6e\u9879",children:"\u914d\u7f6e\u9879"}),"\n",(0,c.jsx)(n.p,{children:"\u8fd9\u91cc\u63d0\u4f9b\u4e86\u4e00\u4efd\u793a\u4f8b\uff0c"}),"\n",(0,c.jsxs)(n.blockquote,{children:["\n",(0,c.jsxs)(n.p,{children:["uni-app ",(0,c.jsx)(n.code,{children:"%PLATFORM%"})," \u7684\u6240\u6709\u53d6\u503c\u53ef\u4ee5\u53c2\u8003\u8fd9\u4e2a",(0,c.jsx)(n.a,{href:"https://uniapp.dcloud.net.cn/tutorial/platform.html#preprocessor",children:"\u94fe\u63a5"})]}),"\n"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-js",children:"const cssMacro = require('weapp-tailwindcss/css-macro');\n/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  // ...\n  plugins: [\n    /* \u8fd9\u91cc\u53ef\u4ee5\u4f20\u5165\u914d\u7f6e\u9879\uff0c\u9ed8\u8ba4\u53ea\u5305\u62ec ifdef \u548c ifndef */\n    cssMacro({\n      // \u662f\u5426\u5305\u542b ifdef \u548c ifndef\uff0c\u9ed8\u8ba4\u4e3a true\n      // dynamic: true,\n      // \u4f20\u5165\u4e00\u4e2a variantsMap\n      variantsMap: {\n        // wx \u5bf9\u5e94\u7684 %PLATFORM% \u4e3a 'MP-WEIXIN'\n        // \u6709\u4e86\u8fd9\u4e2a\u914d\u7f6e\uff0c\u4f60\u5c31\u53ef\u4ee5\u4f7f\u7528 wx:bg-red-300\n        wx: 'MP-WEIXIN',\n        // -wx\uff0c\u8bed\u4e49\u4e0a\u4e3a\u975e\u5fae\u4fe1\n        // \u90a3\u5c31\u4f20\u5165\u4e00\u4e2a obj \u628a negative \u8bbe\u7f6e\u4e3a true \n        // \u5c31\u4f1a\u7f16\u8bd1\u51fa ifndef \u7684\u6307\u4ee4\n        // \u6709\u4e86\u8fd9\u4e2a\u914d\u7f6e\uff0c\u4f60\u5c31\u53ef\u4ee5\u4f7f\u7528 -wx:bg-red-300\n        '-wx': {\n          value: 'MP-WEIXIN',\n          negative: true\n        },\n        mv: {\n          // \u53ef\u4ee5\u4f7f\u7528\u8868\u8fbe\u5f0f\n          value: 'H5 || MP-WEIXIN'\n        },\n        '-mv': {\n          // \u53ef\u4ee5\u4f7f\u7528\u8868\u8fbe\u5f0f\n          value: 'H5 || MP-WEIXIN',\n          negative: true\n        }\n      }\n    }),\n  ],\n};\n"})}),"\n",(0,c.jsx)(n.h2,{id:"ide\u667a\u80fd\u63d0\u793a",children:"IDE\u667a\u80fd\u63d0\u793a"}),"\n",(0,c.jsxs)(n.p,{children:["\u53ea\u8981\u4f60\u4f7f\u7528 ",(0,c.jsx)(n.code,{children:"vscode"}),"/",(0,c.jsx)(n.code,{children:"webstorm"})," \u8fd9\u7c7bIDE\uff0c\u52a0\u4e0a\u5b89\u88c5\u4e86 ",(0,c.jsx)(n.code,{children:"tailwindcss"})," \u7684\u5b98\u65b9\u63d2\u4ef6\u3002"]}),"\n",(0,c.jsxs)(n.p,{children:["\u667a\u80fd\u63d0\u793a\u4f1a\u6839\u636e\u4f60\u5bf9 ",(0,c.jsx)(n.code,{children:"cssMacro"})," \u8fd9\u4e2a\u63d2\u4ef6\u7684\u914d\u7f6e\uff0c\u76f4\u63a5\u751f\u6210\u51fa\u6765\uff01"]}),"\n",(0,c.jsxs)(n.blockquote,{children:["\n",(0,c.jsxs)(n.p,{children:["\u5047\u5982\u6ca1\u6709\u4e0b\u65b9\u7684\u667a\u80fd\u63d0\u793a\u51fa\u73b0\uff0c\u6709\u53ef\u80fd\u662f ",(0,c.jsx)(n.code,{children:"tailwindcss"})," \u63d2\u4ef6\u6302\u4e86\uff0c\u8fd9\u65f6\u5019\u53ef\u4ee5\u6539\u597d\u914d\u7f6e\u4e4b\u540e ",(0,c.jsx)(n.strong,{children:"\u91cd\u542f"})," ",(0,c.jsx)(n.code,{children:"vscode"})," \u4ee5\u91cd\u65b0\u8fd0\u884c\u63d2\u4ef6"]}),"\n"]}),"\n",(0,c.jsxs)(n.p,{children:["\u8fd9\u91cc\u6211\u4eec\u4ee5\u4e0a\u9762 ",(0,c.jsx)(n.code,{children:"\u914d\u7f6e\u9879"})," \u4e3a\u4f8b:"]}),"\n",(0,c.jsx)(n.h3,{id:"\u52a8\u6001\u63d0\u793a-ifdef--\u548c-ifndef-",children:"\u52a8\u6001\u63d0\u793a: ifdef-[] \u548c ifndef-[]"}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.img,{alt:"macro-tip0",src:s(7970).A+"",width:"1156",height:"454"})}),"\n",(0,c.jsx)(n.h3,{id:"\u914d\u7f6e\u7684\u9759\u6001\u63d0\u793a-wx-\u548c--wx",children:"\u914d\u7f6e\u7684\u9759\u6001\u63d0\u793a: wx \u548c -wx"}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.img,{alt:"macro-tip1",src:s(9099).A+"",width:"1120",height:"500"})})]})}function p(e={}){const{wrapper:n}={...(0,d.R)(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}},7970:(e,n,s)=>{s.d(n,{A:()=>i});const i=s.p+"assets/images/macro-tip0-9722d117db275be702b9650e28de0775.png"},9099:(e,n,s)=>{s.d(n,{A:()=>i});const i=s.p+"assets/images/macro-tip1-afa3f4742673403613b9cce4280ba0e6.png"},972:(e,n,s)=>{s.d(n,{R:()=>l,x:()=>r});var i=s(8225);const c={},d=i.createContext(c);function l(e){const n=i.useContext(d);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:l(e.components),i.createElement(d.Provider,{value:n},e.children)}}}]);