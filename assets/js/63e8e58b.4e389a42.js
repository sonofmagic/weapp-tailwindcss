"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[1861],{773:(s,e,n)=>{n.r(e),n.d(e,{assets:()=>d,contentTitle:()=>o,default:()=>a,frontMatter:()=>r,metadata:()=>i,toc:()=>l});const i=JSON.parse('{"id":"multi-platform","title":"\u8de8\u7aef\u6ce8\u610f\u4e8b\u9879","description":"\u4f55\u65f6\u5f00\u542f\u63d2\u4ef6","source":"@site/docs/multi-platform.md","sourceDirName":".","slug":"/multi-platform","permalink":"/weapp-tailwindcss/docs/multi-platform","draft":false,"unlisted":false,"editUrl":"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/multi-platform.md","tags":[],"version":"current","frontMatter":{},"sidebar":"issuesSidebar","previous":{"title":"Tailwindcss \u683c\u5f0f\u5316","permalink":"/weapp-tailwindcss/docs/issues/format"},"next":{"title":"H5 \u7aef\u539f\u751f toast \u6837\u5f0f\u504f\u79fb\u95ee\u9898","permalink":"/weapp-tailwindcss/docs/issues/toast-svg-bug"}}');var c=n(6106),t=n(2036);const r={},o="\u8de8\u7aef\u6ce8\u610f\u4e8b\u9879",d={},l=[{value:"\u4f55\u65f6\u5f00\u542f\u63d2\u4ef6",id:"\u4f55\u65f6\u5f00\u542f\u63d2\u4ef6",level:2},{value:"uni-app \u6253\u5305\u5b89\u5353 <code>rgb()</code> \u989c\u8272\u5931\u6548\u95ee\u9898",id:"uni-app-\u6253\u5305\u5b89\u5353-rgb-\u989c\u8272\u5931\u6548\u95ee\u9898",level:2},{value:"\u5b89\u88c5 <code>postcss-preset-env</code>",id:"\u5b89\u88c5-postcss-preset-env",level:3},{value:"\u8bbe\u7f6e <code>postcss.config.js</code>",id:"\u8bbe\u7f6e-postcssconfigjs",level:3}];function p(s){const e={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",pre:"pre",...(0,t.R)(),...s.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(e.header,{children:(0,c.jsx)(e.h1,{id:"\u8de8\u7aef\u6ce8\u610f\u4e8b\u9879",children:"\u8de8\u7aef\u6ce8\u610f\u4e8b\u9879"})}),"\n",(0,c.jsx)(e.h2,{id:"\u4f55\u65f6\u5f00\u542f\u63d2\u4ef6",children:"\u4f55\u65f6\u5f00\u542f\u63d2\u4ef6"}),"\n",(0,c.jsxs)(e.p,{children:["\u672c\u63d2\u4ef6\u4e3b\u8981\u4f5c\u7528\u4e8e\u5c0f\u7a0b\u5e8f\u73af\u5883\uff0c\u8ba9\u5f00\u53d1\u8005\u53ef\u4ee5\u5728\u5c0f\u7a0b\u5e8f\u73af\u5883\u4e0b\u53ef\u4ee5\u4f7f\u7528 ",(0,c.jsx)(e.code,{children:"tailwindcss"})," \u7684\u7279\u6027"]}),"\n",(0,c.jsxs)(e.p,{children:["\u7136\u800c\u5728 ",(0,c.jsx)(e.code,{children:"h5"})," \u548c ",(0,c.jsx)(e.code,{children:"app"})," \u4e2d\uff0c\u5b83\u4eec\u672c\u6765\u5c31\u662f ",(0,c.jsx)(e.code,{children:"tailwindcss"})," \u652f\u6301\u7684\u73af\u5883\uff0c\u6240\u4ee5\u662f\u6ca1\u6709\u5fc5\u8981\u5f00\u542f\u672c\u63d2\u4ef6\u7684\u3002"]}),"\n",(0,c.jsx)(e.p,{children:"\u6240\u4ee5\u4f60\u53ef\u4ee5\u8fd9\u6837\u5199:"}),"\n",(0,c.jsx)(e.pre,{children:(0,c.jsx)(e.code,{className:"language-js",children:'const isH5 = process.env.UNI_PLATFORM === "h5";\n// uni-app v2\nconst isApp = process.env.UNI_PLATFORM === "app-plus";\n// uni-app v3\n// const isApp = process.env.UNI_PLATFORM === "app";\nconst WeappTailwindcssDisabled = isH5 || isApp;\n\n// 2\u79cd\u9009\u4e00\u5373\u53ef region start\n// 1. \u4f20\u9012 disabled option\nconst vitePlugins = [uni(), uvwt({\n  disabled: WeappTailwindcssDisabled\n})];\n\n// 2. \u6309\u7167\u6761\u4ef6\u8bbe\u7f6e\u63d2\u4ef6\nconst vitePlugins = [uni()];\n\nif (!WeappTailwindcssDisabled) {\n  vitePlugins.push(\n    uvwt()\n  );\n}\n// region end\n'})}),"\n",(0,c.jsxs)(e.h2,{id:"uni-app-\u6253\u5305\u5b89\u5353-rgb-\u989c\u8272\u5931\u6548\u95ee\u9898",children:["uni-app \u6253\u5305\u5b89\u5353 ",(0,c.jsx)(e.code,{children:"rgb()"})," \u989c\u8272\u5931\u6548\u95ee\u9898"]}),"\n",(0,c.jsxs)(e.p,{children:["\u8fd9\u662f\u7531\u4e8e ",(0,c.jsx)(e.code,{children:"uni-app"})," \u6253\u5305\u6210\u5b89\u5353\u4e2d ",(0,c.jsx)(e.code,{children:"webview"})," \u5185\u6838\u7248\u672c\u8f83\u4f4e\uff0c\u65e0\u6cd5\u517c\u5bb9 ",(0,c.jsx)(e.code,{children:"rgb(245 247 255 / var(--tw-bg-opacity))"})," \u8fd9\u6837\u7684 ",(0,c.jsx)(e.code,{children:"css"})," \u5199\u6cd5\u5bfc\u81f4\u7684"]}),"\n",(0,c.jsxs)(e.p,{children:["\u8fd9\u65f6\u5019\u6211\u4eec\u9700\u8981\u628a\u8fd9\u4e2a\u5199\u6cd5\uff0c\u8f6c\u6362\u4e3a\u517c\u5bb9\u5199\u6cd5: ",(0,c.jsx)(e.code,{children:"rgba(245, 247, 255, var(--tw-bg-opacity))"}),"\uff0c\u5177\u4f53\u89e3\u51b3\u65b9\u6848:"]}),"\n",(0,c.jsxs)(e.h3,{id:"\u5b89\u88c5-postcss-preset-env",children:["\u5b89\u88c5 ",(0,c.jsx)(e.code,{children:"postcss-preset-env"})]}),"\n",(0,c.jsx)(e.pre,{children:(0,c.jsx)(e.code,{className:"language-bash",children:"# npm / yarn / pnpm\nnpm i -D postcss-preset-env\n"})}),"\n",(0,c.jsxs)(e.h3,{id:"\u8bbe\u7f6e-postcssconfigjs",children:["\u8bbe\u7f6e ",(0,c.jsx)(e.code,{children:"postcss.config.js"})]}),"\n",(0,c.jsx)(e.pre,{children:(0,c.jsx)(e.code,{className:"language-js",children:"module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n    'postcss-preset-env': {\n      browsers: 'chrome >= 50', // configure a compatible browser version\n    },\n  },\n};\n"})}),"\n",(0,c.jsxs)(e.p,{children:["\u8fd9\u6837\uff0c\u6240\u6709\u7684 ",(0,c.jsx)(e.code,{children:"rgb"})," \u548c ",(0,c.jsx)(e.code,{children:"/"})," \u5199\u6cd5\u5c31\u88ab\u8f6c\u5316\u6210\u517c\u5bb9\u5199\u6cd5\u4e86\u3002"]}),"\n",(0,c.jsxs)(e.p,{children:["\u76f8\u5173issue\u8be6\u89c1:",(0,c.jsx)(e.a,{href:"https://github.com/tailwindlabs/tailwindcss/issues/7618#issuecomment-1140693288",children:"https://github.com/tailwindlabs/tailwindcss/issues/7618#issuecomment-1140693288"})]})]})}function a(s={}){const{wrapper:e}={...(0,t.R)(),...s.components};return e?(0,c.jsx)(e,{...s,children:(0,c.jsx)(p,{...s})}):p(s)}},2036:(s,e,n)=>{n.d(e,{R:()=>r,x:()=>o});var i=n(7378);const c={},t=i.createContext(c);function r(s){const e=i.useContext(t);return i.useMemo((function(){return"function"==typeof s?s(e):{...e,...s}}),[e,s])}function o(s){let e;return e=s.disableParentContext?"function"==typeof s.components?s.components(c):s.components||c:r(s.components),i.createElement(t.Provider,{value:e},s.children)}}}]);