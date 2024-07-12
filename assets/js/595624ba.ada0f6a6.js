"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[3865],{5731:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>a,contentTitle:()=>i,default:()=>p,frontMatter:()=>c,metadata:()=>o,toc:()=>d});var t=n(6106),r=n(9252);const c={},i="Nodejs API",o={id:"quick-start/frameworks/api",title:"Nodejs API",description:"\u7248\u672c 2.11.0+ , \u6b64\u4e3a\u9ad8\u9636 api\uff0c\u4f7f\u7528\u8d77\u6765\u6709\u96be\u5ea6\uff0c\u4e0d\u9002\u5408\u65b0\u624b\uff0c\u5047\u5982\u4f60\u4e0d\u6e05\u695a\u4f60\u5728\u505a\u4ec0\u4e48\uff0c\u8bf7\u4f7f\u7528 webpack/vite/gulp \u63d2\u4ef6",source:"@site/docs/quick-start/frameworks/api.md",sourceDirName:"quick-start/frameworks",slug:"/quick-start/frameworks/api",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/api",draft:!1,unlisted:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/frameworks/api.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"\u539f\u751f\u5f00\u53d1(\u6253\u5305\u65b9\u6848)",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/native"},next:{title:"4. rem \u8f6c rpx (\u6216 px)",permalink:"/weapp-tailwindcss/docs/quick-start/rem2rpx"}},a={},d=[{value:"\u5982\u4f55\u4f7f\u7528",id:"\u5982\u4f55\u4f7f\u7528",level:2}];function l(e){const s={admonition:"admonition",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",p:"p",pre:"pre",strong:"strong",...(0,r.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(s.h1,{id:"nodejs-api",children:"Nodejs API"}),"\n",(0,t.jsxs)(s.blockquote,{children:["\n",(0,t.jsxs)(s.p,{children:["\u7248\u672c 2.11.0+ , \u6b64\u4e3a\u9ad8\u9636 ",(0,t.jsx)(s.code,{children:"api"}),"\uff0c\u4f7f\u7528\u8d77\u6765\u6709\u96be\u5ea6\uff0c\u4e0d\u9002\u5408\u65b0\u624b\uff0c\u5047\u5982\u4f60\u4e0d\u6e05\u695a\u4f60\u5728\u505a\u4ec0\u4e48\uff0c\u8bf7\u4f7f\u7528 ",(0,t.jsx)(s.code,{children:"webpack/vite/gulp"})," \u63d2\u4ef6"]}),"\n"]}),"\n",(0,t.jsxs)(s.p,{children:["\u6709\u65f6\u5019,\u6211\u4eec\u4e0d\u4e00\u5b9a\u4f1a\u4f7f\u7528 ",(0,t.jsx)(s.code,{children:"webpack/vite/gulp"}),"\uff0c\u53ef\u80fd\u662f\u76f4\u63a5\u4f7f\u7528 ",(0,t.jsx)(s.code,{children:"nodejs"})," \u53bb\u6784\u5efa\u5e94\u7528\uff0c\u6216\u8005\u5c01\u88c5\u66f4\u9ad8\u9636\u7684\u5de5\u5177\uff0c\u8fd9\u65f6\u5019\u53ef\u4ee5\u4f7f\u7528",(0,t.jsx)(s.code,{children:"api"}),"\u53bb\u8f6c\u4e49\u4f60\u7684\u5e94\u7528\u3002"]}),"\n",(0,t.jsx)(s.h2,{id:"\u5982\u4f55\u4f7f\u7528",children:"\u5982\u4f55\u4f7f\u7528"}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-js",children:"// mjs or\nimport { createContext } from 'weapp-tailwindcss/core'\n// cjs\nconst { createContext } = require('weapp-tailwindcss/core')\n\nasync function main(){\n  // createContext \u53ef\u4f20\u5165\u53c2\u6570\uff0c\u7c7b\u578b\u4e3a UserDefinedOptions\n  const ctx = createContext()\n  // 3.1.0 \u5f00\u59cb api \u90fd\u662f\u5f02\u6b65\u7684\uff0c\u4e3a rust \u5de5\u5177\u94fe\u505a\u51c6\u5907\n  const wxssCode = await ctx.transformWxss(rawWxssCode)\n  const wxmlCode = await ctx.transformWxml(rawWxmlCode)\n  const jsCode = await ctx.transformJs(rawJsCode)\n  // \u4f20\u5165\u53c2\u6570\u548c\u8f93\u51fa\u7ed3\u679c\u5747\u4e3a \u5b57\u7b26\u4e32 string\n\n  // \u7136\u540e\u4f60\u5c31\u53ef\u4ee5\u6839\u636e\u7ed3\u679c\u53bb\u590d\u5199\u4f60\u7684\u6587\u4ef6\u4e86\n}\n\nmain()\n"})}),"\n",(0,t.jsxs)(s.admonition,{type:"tip",children:[(0,t.jsxs)(s.p,{children:["\u6709\u4e00\u70b9\u8981\u7279\u522b\u6ce8\u610f\uff0c\u5728\u4f7f\u7528 ",(0,t.jsx)(s.code,{children:"ctx.transformJs"})," \u7684\u65f6\u5019\uff0c\u4e00\u5b9a\u8981\u786e\u4fdd ",(0,t.jsx)(s.code,{children:"tailwindcss"})," \u5df2\u7ecf\u6267\u884c\u5b8c\u6bd5\u4e86\uff01\u4e5f\u5c31\u662f\u8bf4\u5bf9\u5e94\u7684 ",(0,t.jsx)(s.code,{children:"postcss"})," \u6267\u884c\u5b8c\u6bd5\u3002"]}),(0,t.jsxs)(s.p,{children:["\u56e0\u4e3a ",(0,t.jsx)(s.code,{children:"js"})," \u7684\u8f6c\u4e49\u4f9d\u8d56 ",(0,t.jsx)(s.code,{children:"tailwindcss"})," \u7684\u6267\u884c\u7ed3\u679c\uff0c\u7136\u540e\u6839\u636e\u5b83\uff0c\u518d\u53bb\u4ece\u4f60\u7684\u4ee3\u7801\u4e2d\u627e\u5230 ",(0,t.jsx)(s.code,{children:"tailwindcss"})," \u63d0\u53d6\u51fa\u7684\u5b57\u7b26\u4e32\uff0c\u518d\u8fdb\u884c\u5904\u7406\u7684\u3002"]}),(0,t.jsxs)(s.p,{children:["\u5047\u5982\u6b64\u65f6 ",(0,t.jsx)(s.code,{children:"tailwindcss"})," \u8fd8\u6ca1\u6709\u6267\u884c\uff0c\u5219\u63d2\u4ef6\u5c31\u53ea\u80fd\u83b7\u53d6\u5230\u4e00\u4e2a ",(0,t.jsx)(s.strong,{children:"\u7a7a\u7684"})," \u63d0\u53d6\u5b57\u7b26\u4e32\u96c6\u5408\uff0c\u8fd9\u5c31\u65e0\u6cd5\u8fdb\u884c\u5339\u914d\uff0c\u4ece\u800c\u5bfc\u81f4\u4f60\u5199\u5728 ",(0,t.jsx)(s.code,{children:"js"})," \u91cc\u7684\u7c7b\u540d\u8f6c\u4e49\u5931\u6548\u3002"]}),(0,t.jsx)(s.p,{children:"\u6bd4\u5982\u8fd9\u79cd\u60c5\u51b5:"}),(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-js",children:"// index.js\nconst classNames = ['mb-[1.5rem]']\n"})}),(0,t.jsx)(s.p,{children:"\u53e6\u5916\u4f7f\u7528\u6b64\u79cd\u65b9\u5f0f\uff0c\u7f16\u8bd1\u7f13\u5b58\u9700\u8981\u81ea\u884c\u5904\u7406\uff0c\u4e14\u6682\u65f6\u6ca1\u6709\u7c7b\u540d\u7684\u538b\u7f29\u4e0e\u6df7\u6dc6\u529f\u80fd"})]})]})}function p(e={}){const{wrapper:s}={...(0,r.R)(),...e.components};return s?(0,t.jsx)(s,{...e,children:(0,t.jsx)(l,{...e})}):l(e)}},9252:(e,s,n)=>{n.d(s,{R:()=>i,x:()=>o});var t=n(7378);const r={},c=t.createContext(r);function i(e){const s=t.useContext(c);return t.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function o(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:i(e.components),t.createElement(c.Provider,{value:s},e.children)}}}]);