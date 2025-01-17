"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[8318],{383:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>c,default:()=>u,frontMatter:()=>a,metadata:()=>s,toc:()=>l});const s=JSON.parse('{"id":"quick-start/frameworks/rax","title":"Rax (react)","description":"\u5728\u6839\u76ee\u5f55\u4e0b\u521b\u5efa\u4e00\u4e2a build.plugin.js \u6587\u4ef6\uff0c\u7136\u540e\u5728 build.json \u4e2d\u6ce8\u518c\uff1a","source":"@site/docs/quick-start/frameworks/rax.md","sourceDirName":"quick-start/frameworks","slug":"/quick-start/frameworks/rax","permalink":"/weapp-tailwindcss/docs/quick-start/frameworks/rax","draft":false,"unlisted":false,"editUrl":"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/frameworks/rax.md","tags":[],"version":"current","frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"Taro (\u6240\u6709\u6846\u67b6)","permalink":"/weapp-tailwindcss/docs/quick-start/frameworks/taro"},"next":{"title":"mpx (\u539f\u751f\u589e\u5f3a)","permalink":"/weapp-tailwindcss/docs/quick-start/frameworks/mpx"}}');var r=t(7557),i=t(5809);const a={},c="Rax (react)",o={},l=[];function d(e){const n={code:"code",h1:"h1",header:"header",p:"p",pre:"pre",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"rax-react",children:"Rax (react)"})}),"\n",(0,r.jsxs)(n.p,{children:["\u5728\u6839\u76ee\u5f55\u4e0b\u521b\u5efa\u4e00\u4e2a ",(0,r.jsx)(n.code,{children:"build.plugin.js"})," \u6587\u4ef6\uff0c\u7136\u540e\u5728 ",(0,r.jsx)(n.code,{children:"build.json"})," \u4e2d\u6ce8\u518c\uff1a"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-json",metastring:'title="build.json"',children:'{\n  "plugins": [\n    "./build.plugin.js"\n  ],\n}\n'})}),"\n",(0,r.jsxs)(n.p,{children:["\u56de\u5230 ",(0,r.jsx)(n.code,{children:"build.plugin.js"})]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",metastring:'title="build.plugin.js"',children:"const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')\nmodule.exports = ({ context, onGetWebpackConfig }) => {\n  onGetWebpackConfig((config) => {\n    config.plugin('UnifiedWebpackPluginV5').use(UnifiedWebpackPluginV5, [\n      {\n        appType: 'rax',\n      },\n    ]);\n  });\n};\n\n"})})]})}function u(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},5809:(e,n,t)=>{t.d(n,{R:()=>a,x:()=>c});var s=t(8225);const r={},i=s.createContext(r);function a(e){const n=s.useContext(i);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:a(e.components),s.createElement(i.Provider,{value:n},e.children)}}}]);