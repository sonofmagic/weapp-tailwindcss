"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[5671],{2142:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>o,contentTitle:()=>d,default:()=>p,frontMatter:()=>r,metadata:()=>c,toc:()=>a});const c=JSON.parse('{"id":"quick-start/frameworks/mpx","title":"mpx (\u539f\u751f\u589e\u5f3a)","description":"\u5728 vue.config.js \u4e2d\u6ce8\u518c\uff1a","source":"@site/docs/quick-start/frameworks/mpx.md","sourceDirName":"quick-start/frameworks","slug":"/quick-start/frameworks/mpx","permalink":"/weapp-tailwindcss/docs/quick-start/frameworks/mpx","draft":false,"unlisted":false,"editUrl":"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/frameworks/mpx.md","tags":[],"version":"current","frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"Rax (react)","permalink":"/weapp-tailwindcss/docs/quick-start/frameworks/rax"},"next":{"title":"\u539f\u751f\u5f00\u53d1(\u6253\u5305\u65b9\u6848)","permalink":"/weapp-tailwindcss/docs/quick-start/frameworks/native"}}');var i=n(6106),t=n(2036);const r={},d="mpx (\u539f\u751f\u589e\u5f3a)",o={},a=[{value:"mpx \u4e2d\u7684 vscode tailwindcss \u667a\u80fd\u63d0\u793a\u7f3a\u5931\u8bbe\u7f6e",id:"mpx-\u4e2d\u7684-vscode-tailwindcss-\u667a\u80fd\u63d0\u793a\u7f3a\u5931\u8bbe\u7f6e",level:2}];function l(e){const s={code:"code",h1:"h1",h2:"h2",header:"header",img:"img",p:"p",pre:"pre",...(0,t.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.header,{children:(0,i.jsx)(s.h1,{id:"mpx-\u539f\u751f\u589e\u5f3a",children:"mpx (\u539f\u751f\u589e\u5f3a)"})}),"\n",(0,i.jsxs)(s.p,{children:["\u5728 ",(0,i.jsx)(s.code,{children:"vue.config.js"})," \u4e2d\u6ce8\u518c\uff1a"]}),"\n",(0,i.jsx)(s.pre,{children:(0,i.jsx)(s.code,{className:"language-js",metastring:'title="vue.config.js"',children:"const { defineConfig } = require('@vue/cli-service')\nconst { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')\n\nmodule.exports = defineConfig({\n  // other options\n  configureWebpack(config) {\n    config.plugins.push(new UnifiedWebpackPluginV5({\n      appType: 'mpx'\n    }))\n  }\n})\n\n"})}),"\n",(0,i.jsx)(s.h2,{id:"mpx-\u4e2d\u7684-vscode-tailwindcss-\u667a\u80fd\u63d0\u793a\u7f3a\u5931\u8bbe\u7f6e",children:"mpx \u4e2d\u7684 vscode tailwindcss \u667a\u80fd\u63d0\u793a\u7f3a\u5931\u8bbe\u7f6e"}),"\n",(0,i.jsxs)(s.p,{children:["\u6211\u4eec\u77e5\u9053 ",(0,i.jsx)(s.code,{children:"tailwindcss"})," \u6700\u4f73\u5b9e\u8df5\uff0c\u662f\u8981\u7ed3\u5408 ",(0,i.jsx)(s.code,{children:"vscode"}),"/",(0,i.jsx)(s.code,{children:"webstorm"}),"\u63d0\u793a\u63d2\u4ef6\u4e00\u8d77\u4f7f\u7528\u7684\u3002"]}),"\n",(0,i.jsxs)(s.p,{children:["\u5047\u5982\u4f60\u9047\u5230\u4e86\uff0c\u5728 ",(0,i.jsx)(s.code,{children:"vscode"})," \u7684 ",(0,i.jsx)(s.code,{children:"mpx"})," \u6587\u4ef6\u4e2d\uff0c\u7f16\u5199 ",(0,i.jsx)(s.code,{children:"class"})," \u6ca1\u6709\u51fa\u667a\u80fd\u63d0\u793a\u7684\u60c5\u51b5\uff0c\u53ef\u4ee5\u53c2\u8003\u4ee5\u4e0b\u6b65\u9aa4\u3002"]}),"\n",(0,i.jsxs)(s.p,{children:["\u8fd9\u91cc\u6211\u4eec\u4ee5 ",(0,i.jsx)(s.code,{children:"vscode"})," \u4e3a\u4f8b:"]}),"\n",(0,i.jsxs)(s.p,{children:["\u63a5\u7740\u627e\u5230 ",(0,i.jsx)(s.code,{children:"Tailwind CSS IntelliSense"})," \u7684 ",(0,i.jsx)(s.code,{children:"\u6269\u5c55\u8bbe\u7f6e"})]}),"\n",(0,i.jsxs)(s.p,{children:["\u5728 ",(0,i.jsx)(s.code,{children:"include languages"}),",\u624b\u52a8\u6807\u8bb0 ",(0,i.jsx)(s.code,{children:"mpx"})," \u7684\u7c7b\u578b\u4e3a ",(0,i.jsx)(s.code,{children:"html"})]}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.img,{alt:"\u5982\u56fe\u6240\u793a",src:n(9445).A+"",width:"1256",height:"605"})}),"\n",(0,i.jsxs)(s.p,{children:["\u4fdd\u5b58\u8bbe\u7f6e\uff0c\u518d\u53bb",(0,i.jsx)(s.code,{children:"mpx"}),"\u6587\u4ef6\u91cc\u5199",(0,i.jsx)(s.code,{children:"class"}),"\u7684\u65f6\u5019\uff0c\u667a\u80fd\u63d0\u793a\u5c31\u51fa\u6765\u5566\u3002"]})]})}function p(e={}){const{wrapper:s}={...(0,t.R)(),...e.components};return s?(0,i.jsx)(s,{...e,children:(0,i.jsx)(l,{...e})}):l(e)}},9445:(e,s,n)=>{n.d(s,{A:()=>c});const c=n.p+"assets/images/vscode-tailwindcss-d15eea300439077dac7e83cf059ec844.png"},2036:(e,s,n)=>{n.d(s,{R:()=>r,x:()=>d});var c=n(7378);const i={},t=c.createContext(i);function r(e){const s=c.useContext(t);return c.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function d(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),c.createElement(t.Provider,{value:s},e.children)}}}]);