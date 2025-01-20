"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[1861],{6668:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>d,contentTitle:()=>o,default:()=>a,frontMatter:()=>r,metadata:()=>i,toc:()=>l});const i=JSON.parse('{"id":"multi-platform","title":"\u8de8\u591a\u7aef\u5e94\u7528\u5f00\u53d1\u6ce8\u610f\u4e8b\u9879","description":"\u4f55\u65f6\u5f00\u542f\u63d2\u4ef6","source":"@site/docs/multi-platform.md","sourceDirName":".","slug":"/multi-platform","permalink":"/weapp-tailwindcss/docs/multi-platform","draft":false,"unlisted":false,"editUrl":"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/multi-platform.md","tags":[],"version":"current","frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"\u751f\u6001\u4ee5\u53ca\u89e3\u51b3\u65b9\u6848","permalink":"/weapp-tailwindcss/docs/community"},"next":{"title":"IDE \u667a\u80fd\u63d0\u793a\u8bbe\u7f6e","permalink":"/weapp-tailwindcss/docs/quick-start/intelliSense"}}');var c=n(7557),t=n(5809);const r={},o="\u8de8\u591a\u7aef\u5e94\u7528\u5f00\u53d1\u6ce8\u610f\u4e8b\u9879",d={},l=[{value:"\u4f55\u65f6\u5f00\u542f\u63d2\u4ef6",id:"\u4f55\u65f6\u5f00\u542f\u63d2\u4ef6",level:2},{value:"uni-app \u6253\u5305\u5b89\u5353 <code>rgb()</code> \u989c\u8272\u5931\u6548\u95ee\u9898",id:"uni-app-\u6253\u5305\u5b89\u5353-rgb-\u989c\u8272\u5931\u6548\u95ee\u9898",level:2},{value:"\u5b89\u88c5 <code>postcss-preset-env</code>",id:"\u5b89\u88c5-postcss-preset-env",level:3},{value:"\u8bbe\u7f6e <code>postcss.config.js</code>",id:"\u8bbe\u7f6e-postcssconfigjs",level:3}];function p(e){const s={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",pre:"pre",...(0,t.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(s.header,{children:(0,c.jsx)(s.h1,{id:"\u8de8\u591a\u7aef\u5e94\u7528\u5f00\u53d1\u6ce8\u610f\u4e8b\u9879",children:"\u8de8\u591a\u7aef\u5e94\u7528\u5f00\u53d1\u6ce8\u610f\u4e8b\u9879"})}),"\n",(0,c.jsx)(s.h2,{id:"\u4f55\u65f6\u5f00\u542f\u63d2\u4ef6",children:"\u4f55\u65f6\u5f00\u542f\u63d2\u4ef6"}),"\n",(0,c.jsxs)(s.p,{children:["\u672c\u63d2\u4ef6\u4e3b\u8981\u4f5c\u7528\u4e8e\u5c0f\u7a0b\u5e8f\u73af\u5883\uff0c\u8ba9\u5f00\u53d1\u8005\u53ef\u4ee5\u5728\u5c0f\u7a0b\u5e8f\u73af\u5883\u4e0b\u53ef\u4ee5\u4f7f\u7528 ",(0,c.jsx)(s.code,{children:"tailwindcss"})," \u7684\u7279\u6027"]}),"\n",(0,c.jsxs)(s.p,{children:["\u7136\u800c\u5728 ",(0,c.jsx)(s.code,{children:"h5"})," \u548c ",(0,c.jsx)(s.code,{children:"app"})," \u4e2d\uff0c\u5b83\u4eec\u672c\u6765\u5c31\u662f ",(0,c.jsx)(s.code,{children:"tailwindcss"})," \u652f\u6301\u7684\u73af\u5883\uff0c\u6240\u4ee5\u662f\u6ca1\u6709\u5fc5\u8981\u5f00\u542f\u672c\u63d2\u4ef6\u7684\u3002"]}),"\n",(0,c.jsxs)(s.p,{children:["\u6240\u4ee5\u4f60\u53ef\u4ee5\u8fd9\u6837\u4f20\u5165 ",(0,c.jsx)(s.code,{children:"disabled"})," \u9009\u9879, \u8fd9\u91cc\u6211\u4eec\u4ee5 ",(0,c.jsx)(s.code,{children:"uni-app"})," \u4e3a\u4f8b:"]}),"\n",(0,c.jsx)(s.pre,{children:(0,c.jsx)(s.code,{className:"language-js",children:'const isH5 = process.env.UNI_PLATFORM === "h5";\n// uni-app v2\n// const isApp = process.env.UNI_PLATFORM === "app-plus";\n// uni-app v3\nconst isApp = process.env.UNI_PLATFORM === "app";\n// \u53ea\u5728\u5c0f\u7a0b\u5e8f\u5e73\u53f0\u5f00\u542f weapp-tailwindcss \u63d2\u4ef6\n// highlight-next-line\nconst WeappTailwindcssDisabled = isH5 || isApp;\n\nconst vitePlugins = [\n  uni(), \n  uvwt({\n    // highlight-next-line\n    disabled: WeappTailwindcssDisabled\n  })\n];\n'})}),"\n",(0,c.jsxs)(s.h2,{id:"uni-app-\u6253\u5305\u5b89\u5353-rgb-\u989c\u8272\u5931\u6548\u95ee\u9898",children:["uni-app \u6253\u5305\u5b89\u5353 ",(0,c.jsx)(s.code,{children:"rgb()"})," \u989c\u8272\u5931\u6548\u95ee\u9898"]}),"\n",(0,c.jsxs)(s.p,{children:["\u8fd9\u662f\u7531\u4e8e ",(0,c.jsx)(s.code,{children:"uni-app"})," \u6253\u5305\u6210\u5b89\u5353\u4e2d ",(0,c.jsx)(s.code,{children:"webview"})," \u5185\u6838\u7248\u672c\u8f83\u4f4e\uff0c\u65e0\u6cd5\u517c\u5bb9 ",(0,c.jsx)(s.code,{children:"rgb(245 247 255 / var(--tw-bg-opacity))"})," \u8fd9\u6837\u7684 ",(0,c.jsx)(s.code,{children:"css"})," \u5199\u6cd5\u5bfc\u81f4\u7684"]}),"\n",(0,c.jsxs)(s.p,{children:["\u8fd9\u65f6\u5019\u6211\u4eec\u9700\u8981\u628a\u8fd9\u4e2a\u5199\u6cd5\uff0c\u8f6c\u6362\u4e3a\u517c\u5bb9\u5199\u6cd5: ",(0,c.jsx)(s.code,{children:"rgba(245, 247, 255, var(--tw-bg-opacity))"}),"\uff0c\u5177\u4f53\u89e3\u51b3\u65b9\u6848:"]}),"\n",(0,c.jsxs)(s.h3,{id:"\u5b89\u88c5-postcss-preset-env",children:["\u5b89\u88c5 ",(0,c.jsx)(s.code,{children:"postcss-preset-env"})]}),"\n",(0,c.jsx)(s.pre,{children:(0,c.jsx)(s.code,{className:"language-bash",children:"# npm / yarn / pnpm\nnpm i -D postcss-preset-env\n"})}),"\n",(0,c.jsxs)(s.h3,{id:"\u8bbe\u7f6e-postcssconfigjs",children:["\u8bbe\u7f6e ",(0,c.jsx)(s.code,{children:"postcss.config.js"})]}),"\n",(0,c.jsx)(s.pre,{children:(0,c.jsx)(s.code,{className:"language-js",children:"module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n    'postcss-preset-env': {\n      browsers: 'chrome >= 50', // configure a compatible browser version\n    },\n  },\n};\n"})}),"\n",(0,c.jsxs)(s.p,{children:["\u8fd9\u6837\uff0c\u6240\u6709\u7684 ",(0,c.jsx)(s.code,{children:"rgb"})," \u548c ",(0,c.jsx)(s.code,{children:"/"})," \u5199\u6cd5\u5c31\u88ab\u8f6c\u5316\u6210\u517c\u5bb9\u5199\u6cd5\u4e86\u3002"]}),"\n",(0,c.jsxs)(s.p,{children:["\u76f8\u5173issue\u8be6\u89c1:",(0,c.jsx)(s.a,{href:"https://github.com/tailwindlabs/tailwindcss/issues/7618#issuecomment-1140693288",children:"https://github.com/tailwindlabs/tailwindcss/issues/7618#issuecomment-1140693288"})]})]})}function a(e={}){const{wrapper:s}={...(0,t.R)(),...e.components};return s?(0,c.jsx)(s,{...e,children:(0,c.jsx)(p,{...e})}):p(e)}},5809:(e,s,n)=>{n.d(s,{R:()=>r,x:()=>o});var i=n(8225);const c={},t=i.createContext(c);function r(e){const s=i.useContext(t);return i.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function o(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:r(e.components),i.createElement(t.Provider,{value:s},e.children)}}}]);