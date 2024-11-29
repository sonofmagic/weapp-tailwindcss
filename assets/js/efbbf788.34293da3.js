"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[4327],{2660:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>d,contentTitle:()=>o,default:()=>h,frontMatter:()=>r,metadata:()=>i,toc:()=>u});const i=JSON.parse('{"id":"quick-start/install","title":"1. \u5b89\u88c5\u4e0e\u914d\u7f6e tailwindcss","description":"\u8bf7\u786e\u4fdd\u4f60\u7684 nodejs \u7248\u672c ^18.17.0 || >=20.5.0\u3002\u76ee\u524d\u4f4e\u4e8e 18 \u7684\u957f\u671f\u7ef4\u62a4\u7248\u672c(\u5076\u6570\u7248\u672c) \u90fd\u5df2\u7ecf\u7ed3\u675f\u4e86\u751f\u547d\u5468\u671f\uff0c\u5efa\u8bae\u5b89\u88c5 nodejs \u7684 LTS \u7248\u672c\uff0c\u8be6\u89c1 nodejs/release\u3002","source":"@site/docs/quick-start/install.mdx","sourceDirName":"quick-start","slug":"/quick-start/install","permalink":"/weapp-tailwindcss/docs/quick-start/install","draft":false,"unlisted":false,"editUrl":"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/install.mdx","tags":[],"version":"current","frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"\u7b80\u4ecb","permalink":"/weapp-tailwindcss/docs/intro"},"next":{"title":"2. \u5b89\u88c5\u8fd9\u4e2a\u63d2\u4ef6","permalink":"/weapp-tailwindcss/docs/quick-start/this-plugin"}}');var t=s(6106),c=s(2036),a=s(5872),l=s(883);const r={},o="1. \u5b89\u88c5\u4e0e\u914d\u7f6e tailwindcss",d={},u=[{value:"1. \u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5 <code>tailwindcss</code>",id:"1-\u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5-tailwindcss",level:2},{value:"2. \u5728\u9879\u76ee\u76ee\u5f55\u4e0b\u521b\u5efa <code>postcss.config.js</code> \u5e76\u6ce8\u518c <code>tailwindcss</code>",id:"2-\u5728\u9879\u76ee\u76ee\u5f55\u4e0b\u521b\u5efa-postcssconfigjs-\u5e76\u6ce8\u518c-tailwindcss",level:2},{value:"3. \u914d\u7f6e <code>tailwind.config.js</code>",id:"3-\u914d\u7f6e-tailwindconfigjs",level:2},{value:"4. \u5f15\u5165 <code>tailwindcss</code>",id:"4-\u5f15\u5165-tailwindcss",level:2},{value:"uni-app",id:"uni-app",level:3},{value:"Taro",id:"taro",level:3},{value:"\u53c2\u8003\u94fe\u63a5",id:"\u53c2\u8003\u94fe\u63a5",level:2}];function p(e){const n={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",pre:"pre",...(0,c.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"1-\u5b89\u88c5\u4e0e\u914d\u7f6e-tailwindcss",children:"1. \u5b89\u88c5\u4e0e\u914d\u7f6e tailwindcss"})}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:["\u8bf7\u786e\u4fdd\u4f60\u7684 ",(0,t.jsx)(n.code,{children:"nodejs"})," \u7248\u672c ",(0,t.jsx)(n.code,{children:"^18.17.0 || >=20.5.0"}),"\u3002\u76ee\u524d\u4f4e\u4e8e ",(0,t.jsx)(n.code,{children:"18"})," \u7684\u957f\u671f\u7ef4\u62a4\u7248\u672c(",(0,t.jsx)(n.code,{children:"\u5076\u6570\u7248\u672c"}),") \u90fd\u5df2\u7ecf\u7ed3\u675f\u4e86\u751f\u547d\u5468\u671f\uff0c\u5efa\u8bae\u5b89\u88c5 ",(0,t.jsx)(n.code,{children:"nodejs"})," \u7684 ",(0,t.jsx)(n.code,{children:"LTS"})," \u7248\u672c\uff0c\u8be6\u89c1 ",(0,t.jsx)(n.a,{href:"https://github.com/nodejs/release",children:"nodejs/release"}),"\u3002"]}),"\n",(0,t.jsxs)(n.p,{children:["\u5047\u5982\u4f60\u5b89\u88c5\u7684 ",(0,t.jsx)(n.code,{children:"nodejs"})," \u592a\u65b0\uff0c\u53ef\u80fd\u4f1a\u51fa\u73b0\u5b89\u88c5\u5305\u4e0d\u517c\u5bb9\u7684\u95ee\u9898\uff0c\u8fd9\u65f6\u5019\u53ef\u4ee5\u6267\u884c\u5b89\u88c5\u547d\u4ee4\u65f6\uff0c\u4f7f\u7528 ",(0,t.jsx)(n.code,{children:"--ignore-engines"})," \u53c2\u6570\u8fdb\u884c ",(0,t.jsx)(n.code,{children:"nodejs"})," \u7248\u672c\u7684\u5ffd\u7565 \u3002"]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["\u9996\u5148\u5b89\u88c5\u672c\u63d2\u4ef6\u524d\uff0c\u6211\u4eec\u9700\u8981\u628a ",(0,t.jsx)(n.code,{children:"tailwindcss"})," \u5bf9\u5e94\u7684\u73af\u5883\u548c\u914d\u7f6e\u5b89\u88c5\u597d\u3002"]}),"\n",(0,t.jsxs)(n.p,{children:["\u8fd9\u91cc\u6211\u4eec\u53c2\u8003 ",(0,t.jsx)(n.code,{children:"tailwindcss"})," \u5b98\u7f51\u4e2d ",(0,t.jsx)(n.code,{children:"postcss"})," \u7684\u4f7f\u7528\u65b9\u5f0f\u8fdb\u884c\u5b89\u88c5 (",(0,t.jsx)(n.a,{href:"https://tailwindcss.com/docs/installation/using-postcss",children:"\u53c2\u8003\u94fe\u63a5"}),")"]}),"\n",(0,t.jsxs)(n.h2,{id:"1-\u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5-tailwindcss",children:["1. \u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5 ",(0,t.jsx)(n.code,{children:"tailwindcss"})]}),"\n",(0,t.jsxs)(a.A,{children:[(0,t.jsx)(l.A,{label:"npm",value:"npm",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"npm i -D tailwindcss postcss autoprefixer\n# \u521d\u59cb\u5316 tailwind.config.js \u6587\u4ef6\nnpx tailwindcss init\n"})})}),(0,t.jsx)(l.A,{label:"yarn",value:"yarn",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"yarn add -D tailwindcss postcss autoprefixer\n# \u521d\u59cb\u5316 tailwind.config.js \u6587\u4ef6\nnpx tailwindcss init\n"})})}),(0,t.jsx)(l.A,{label:"pnpm",value:"pnpm",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"pnpm i -D tailwindcss postcss autoprefixer\n# \u521d\u59cb\u5316 tailwind.config.js \u6587\u4ef6\nnpx tailwindcss init\n"})})})]}),"\n",(0,t.jsx)(n.admonition,{type:"info",children:(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"tailwindcss"})," \u6700\u65b0\u7248\u672c(",(0,t.jsx)(n.code,{children:"3.x"}),")\u5bf9\u5e94\u7684 ",(0,t.jsx)(n.code,{children:"postcss"})," \u5927\u7248\u672c\u4e3a ",(0,t.jsx)(n.code,{children:"8"}),"\uff0c\u5047\u5982\u4f60\u4f7f\u7528\u50cf ",(0,t.jsx)(n.code,{children:"uni-app"})," \u6216 ",(0,t.jsx)(n.code,{children:"taro"})," \u8fd9\u6837\u7684\u8de8\u7aef\u6846\u67b6\uff0c\u5927\u6982\u7387\u5df2\u7ecf\u5185\u7f6e\u4e86 ",(0,t.jsx)(n.code,{children:"postcss"})," \u548c ",(0,t.jsx)(n.code,{children:"autoprefixer"})]})}),"\n",(0,t.jsxs)(n.h2,{id:"2-\u5728\u9879\u76ee\u76ee\u5f55\u4e0b\u521b\u5efa-postcssconfigjs-\u5e76\u6ce8\u518c-tailwindcss",children:["2. \u5728\u9879\u76ee\u76ee\u5f55\u4e0b\u521b\u5efa ",(0,t.jsx)(n.code,{children:"postcss.config.js"})," \u5e76\u6ce8\u518c ",(0,t.jsx)(n.code,{children:"tailwindcss"})]}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:["\u6ce8\u610f\uff1a\u8fd9\u53ea\u662f\u6bd4\u8f83\u666e\u904d\u7684\u6ce8\u518c\u65b9\u5f0f\uff0c\u5404\u4e2a\u6846\u67b6\u5f88\u6709\u53ef\u80fd\u662f\u4e0d\u540c\u7684! \u6bd4\u5982 ",(0,t.jsx)(n.code,{children:"uni-app vue3 vite"})," \u9879\u76ee\u5c31\u5fc5\u987b\u8981\u5185\u8054\u6ce8\u518c ",(0,t.jsx)(n.code,{children:"postcss"})," \u9009\u9879! \u8be6\u89c1\u4e0b\u65b9\u7684\u6ce8\u610f\u4e8b\u9879"]}),"\n"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",metastring:'title="postcss.config.js"',children:"// \u5047\u5982\u4f60\u4f7f\u7528\u7684\u6846\u67b6/\u5de5\u5177\u4e0d\u652f\u6301 postcss.config.js \u914d\u7f6e\u6587\u4ef6\uff0c\u5219\u53ef\u4ee5\u4f7f\u7528\u5185\u8054\u7684\u5199\u6cd5\nmodule.exports = {\n  plugins: {\n    tailwindcss: {},\n    // \u5047\u5982\u6846\u67b6\u5df2\u7ecf\u5185\u7f6e\u4e86 `autoprefixer`\uff0c\u53ef\u4ee5\u53bb\u9664\u4e0b\u4e00\u884c\n    autoprefixer: {},\n  }\n}\n"})}),"\n",(0,t.jsxs)(n.admonition,{title:"\u6ce8\u610f\u4e8b\u9879",type:"tip",children:[(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"uni-app vite vue3"})," \u9879\u76ee\uff0c\u5fc5\u987b\u5728",(0,t.jsx)(n.code,{children:"vite.config.ts"})," \u6587\u4ef6\u4e2d\uff0c\u4f7f\u7528 ",(0,t.jsx)(n.code,{children:"postcss"})," \u5185\u8054\u7684\u5199\u6cd5\u6ce8\u518c\u63d2\u4ef6\u3002\u76f8\u5173\u5199\u6cd5\u53ef\u4ee5\u53c2\u8003\u6211\u7684\u8fd9\u4e2a\u6a21\u677f\u9879\u76ee: ",(0,t.jsx)(n.a,{href:"https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template",children:"uni-app-vite-vue3-tailwind-vscode-template"}),"\u3002"]}),(0,t.jsxs)(n.p,{children:["\u800c ",(0,t.jsx)(n.code,{children:"uni-app vue webpack5"})," \u9879\u76ee\u4e2d\u7684 ",(0,t.jsx)(n.code,{children:"postcss.config.js"}),"\uff0c\u5728\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0c\u5df2\u7ecf\u9884\u7f6e\u5f88\u591a\u63d2\u4ef6\u5728\u91cc\u9762\uff0c\u914d\u7f6e\u6bd4\u8f83\u7e41\u6742\uff0c\u53ef\u4ee5\u53c2\u8003\u8fd9\u4e2a\u6587\u4ef6 ",(0,t.jsx)(n.a,{href:"https://github.com/sonofmagic/weapp-tailwindcss/blob/main/demo/uni-app-webpack5/postcss.config.js",children:"uni-app-webpack5/postcss.config.js"})]})]}),"\n",(0,t.jsxs)(n.h2,{id:"3-\u914d\u7f6e-tailwindconfigjs",children:["3. \u914d\u7f6e ",(0,t.jsx)(n.code,{children:"tailwind.config.js"})]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"tailwind.config.js"})," \u662f ",(0,t.jsx)(n.code,{children:"tailwindcss"})," \u7684\u914d\u7f6e\u6587\u4ef6\uff0c\u6211\u4eec\u53ef\u4ee5\u5728\u91cc\u9762\u914d\u7f6e ",(0,t.jsx)(n.code,{children:"tailwindcss"})," \u7684\u5404\u79cd\u884c\u4e3a\u3002"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",metastring:'title="tailwind.config.js"',children:"/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  // \u8fd9\u91cc\u7ed9\u51fa\u4e86\u4e00\u4efd uni-app /taro \u901a\u7528\u793a\u4f8b\uff0c\u5177\u4f53\u8981\u6839\u636e\u4f60\u81ea\u5df1\u9879\u76ee\u7684\u76ee\u5f55\u7ed3\u6784\u8fdb\u884c\u914d\u7f6e\n  // \u4e0d\u5728 content \u5305\u62ec\u7684\u6587\u4ef6\u5185\uff0c\u4f60\u7f16\u5199\u7684 class\uff0c\u662f\u4e0d\u4f1a\u751f\u6210\u5bf9\u5e94\u7684css\u5de5\u5177\u7c7b\u7684\n  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],\n  // \u5176\u4ed6\u914d\u7f6e\u9879\n  // ...\n  corePlugins: {\n    // \u5c0f\u7a0b\u5e8f\u4e0d\u9700\u8981 preflight\uff0c\u56e0\u4e3a\u8fd9\u4e3b\u8981\u662f\u7ed9 h5 \u7684\uff0c\u5982\u679c\u4f60\u8981\u540c\u65f6\u5f00\u53d1\u5c0f\u7a0b\u5e8f\u548c h5 \u7aef\uff0c\u4f60\u5e94\u8be5\u4f7f\u7528\u73af\u5883\u53d8\u91cf\u6765\u63a7\u5236\u5b83\n    preflight: false\n  }\n}\n"})}),"\n",(0,t.jsxs)(n.h2,{id:"4-\u5f15\u5165-tailwindcss",children:["4. \u5f15\u5165 ",(0,t.jsx)(n.code,{children:"tailwindcss"})]}),"\n",(0,t.jsxs)(n.p,{children:["\u5728\u4f60\u7684\u9879\u76ee\u5165\u53e3\u5f15\u5165 ",(0,t.jsx)(n.code,{children:"tailwindcss"})," \u4f7f\u5b83\u5728\u5c0f\u7a0b\u5e8f\u5168\u5c40\u751f\u6548"]}),"\n",(0,t.jsx)(n.h3,{id:"uni-app",children:"uni-app"}),"\n",(0,t.jsxs)(n.p,{children:["\u6bd4\u5982 ",(0,t.jsx)(n.code,{children:"uni-app"})," \u7684 ",(0,t.jsx)(n.code,{children:"App.vue"})," \u6587\u4ef6:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-html",metastring:'title="App.vue"',children:"<style>\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n/* \u4f7f\u7528 scss */\n/* @import 'tailwindcss/base'; */\n/* @import 'tailwindcss/utilities'; */\n/* @import 'tailwindcss/components'; */\n</style>\n"})}),"\n",(0,t.jsx)(n.h3,{id:"taro",children:"Taro"}),"\n",(0,t.jsxs)(n.p,{children:["\u53c8\u6216\u8005 ",(0,t.jsx)(n.code,{children:"Taro"})," \u7684 ",(0,t.jsx)(n.code,{children:"app.scss"})," \u6587\u4ef6:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-scss",metastring:'title="app.scss"',children:"@import 'tailwindcss/base';\n@import 'tailwindcss/components';\n@import 'tailwindcss/utilities';\n\n// \u975e scss \u7684\u7eaf css \u6587\u4ef6\uff0c\u4e0b\u5217\u5199\u6cd5\u4e5f\u662f\u53ef\u4ee5\u751f\u6548\u7684\n// @tailwind base;\n// @tailwind components;\n// @tailwind utilities;\n"})}),"\n",(0,t.jsxs)(n.p,{children:["\u7136\u540e\u5728 ",(0,t.jsx)(n.code,{children:"app.ts"})," \u91cc\u5f15\u5165\u8fd9\u4e2a\u6837\u5f0f\u6587\u4ef6\u5373\u53ef\u3002"]}),"\n",(0,t.jsxs)(n.p,{children:["\u8fd9\u6837 ",(0,t.jsx)(n.code,{children:"tailwindcss"})," \u7684\u5b89\u88c5\u4e0e\u914d\u7f6e\u5c31\u5b8c\u6210\u4e86\uff0c\u63a5\u4e0b\u6765\u8ba9\u6211\u4eec\u8fdb\u5165\u7b2c\u4e8c\u4e2a\u73af\u8282\uff1a\u5b89\u88c5 ",(0,t.jsx)(n.code,{children:"weapp-tailwindcss"}),"\u3002"]}),"\n",(0,t.jsx)(n.h2,{id:"\u53c2\u8003\u94fe\u63a5",children:"\u53c2\u8003\u94fe\u63a5"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsxs)(n.a,{href:"https://tailwindcss.com/docs/configuration",children:[(0,t.jsx)(n.code,{children:"tailwindcss"})," \u5b98\u65b9\u914d\u7f6e\u9879"]})})]})}function h(e={}){const{wrapper:n}={...(0,c.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(p,{...e})}):p(e)}},883:(e,n,s)=>{s.d(n,{A:()=>a});s(7378);var i=s(3372);const t={tabItem:"tabItem_UwVq"};var c=s(6106);function a(e){let{children:n,hidden:s,className:a}=e;return(0,c.jsx)("div",{role:"tabpanel",className:(0,i.A)(t.tabItem,a),hidden:s,children:n})}},5872:(e,n,s)=>{s.d(n,{A:()=>y});var i=s(7378),t=s(3372),c=s(1971),a=s(505),l=s(3737),r=s(7188),o=s(9149),d=s(5323);function u(e){return i.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,i.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:n,children:s}=e;return(0,i.useMemo)((()=>{const e=n??function(e){return u(e).map((e=>{let{props:{value:n,label:s,attributes:i,default:t}}=e;return{value:n,label:s,attributes:i,default:t}}))}(s);return function(e){const n=(0,o.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,s])}function h(e){let{value:n,tabValues:s}=e;return s.some((e=>e.value===n))}function j(e){let{queryString:n=!1,groupId:s}=e;const t=(0,a.W6)(),c=function(e){let{queryString:n=!1,groupId:s}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!s)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return s??null}({queryString:n,groupId:s});return[(0,r.aZ)(c),(0,i.useCallback)((e=>{if(!c)return;const n=new URLSearchParams(t.location.search);n.set(c,e),t.replace({...t.location,search:n.toString()})}),[c,t])]}function x(e){const{defaultValue:n,queryString:s=!1,groupId:t}=e,c=p(e),[a,r]=(0,i.useState)((()=>function(e){let{defaultValue:n,tabValues:s}=e;if(0===s.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!h({value:n,tabValues:s}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${s.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const i=s.find((e=>e.default))??s[0];if(!i)throw new Error("Unexpected error: 0 tabValues");return i.value}({defaultValue:n,tabValues:c}))),[o,u]=j({queryString:s,groupId:t}),[x,m]=function(e){let{groupId:n}=e;const s=function(e){return e?`docusaurus.tab.${e}`:null}(n),[t,c]=(0,d.Dv)(s);return[t,(0,i.useCallback)((e=>{s&&c.set(e)}),[s,c])]}({groupId:t}),f=(()=>{const e=o??x;return h({value:e,tabValues:c})?e:null})();(0,l.A)((()=>{f&&r(f)}),[f]);return{selectedValue:a,selectValue:(0,i.useCallback)((e=>{if(!h({value:e,tabValues:c}))throw new Error(`Can't select invalid tab value=${e}`);r(e),u(e),m(e)}),[u,m,c]),tabValues:c}}var m=s(3947);const f={tabList:"tabList_y5wR",tabItem:"tabItem_yOg4"};var w=s(6106);function b(e){let{className:n,block:s,selectedValue:i,selectValue:a,tabValues:l}=e;const r=[],{blockElementScrollPositionUntilNextRender:o}=(0,c.a_)(),d=e=>{const n=e.currentTarget,s=r.indexOf(n),t=l[s].value;t!==i&&(o(n),a(t))},u=e=>{let n=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const s=r.indexOf(e.currentTarget)+1;n=r[s]??r[0];break}case"ArrowLeft":{const s=r.indexOf(e.currentTarget)-1;n=r[s]??r[r.length-1];break}}n?.focus()};return(0,w.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,t.A)("tabs",{"tabs--block":s},n),children:l.map((e=>{let{value:n,label:s,attributes:c}=e;return(0,w.jsx)("li",{role:"tab",tabIndex:i===n?0:-1,"aria-selected":i===n,ref:e=>r.push(e),onKeyDown:u,onClick:d,...c,className:(0,t.A)("tabs__item",f.tabItem,c?.className,{"tabs__item--active":i===n}),children:s??n},n)}))})}function g(e){let{lazy:n,children:s,selectedValue:c}=e;const a=(Array.isArray(s)?s:[s]).filter(Boolean);if(n){const e=a.find((e=>e.props.value===c));return e?(0,i.cloneElement)(e,{className:(0,t.A)("margin-top--md",e.props.className)}):null}return(0,w.jsx)("div",{className:"margin-top--md",children:a.map(((e,n)=>(0,i.cloneElement)(e,{key:n,hidden:e.props.value!==c})))})}function v(e){const n=x(e);return(0,w.jsxs)("div",{className:(0,t.A)("tabs-container",f.tabList),children:[(0,w.jsx)(b,{...n,...e}),(0,w.jsx)(g,{...n,...e})]})}function y(e){const n=(0,m.A)();return(0,w.jsx)(v,{...e,children:u(e.children)},String(n))}},2036:(e,n,s)=>{s.d(n,{R:()=>a,x:()=>l});var i=s(7378);const t={},c=i.createContext(t);function a(e){const n=i.useContext(c);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:a(e.components),i.createElement(c.Provider,{value:n},e.children)}}}]);