"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[6201],{1803:(s,e,n)=>{n.r(e),n.d(e,{assets:()=>o,contentTitle:()=>d,default:()=>p,frontMatter:()=>a,metadata:()=>t,toc:()=>r});const t=JSON.parse('{"id":"issues/toast-svg-bug","title":"H5 \u7aef\u539f\u751f toast \u6837\u5f0f\u504f\u79fb\u95ee\u9898","description":"\u5728\u4f7f\u7528 tailwindcss \u7684\u65f6\u5019\uff0c\u7f16\u8bd1\u5230 h5 \u5e73\u53f0\uff0c\u4f7f\u7528 uni.toast / taro.toast \u65f6\uff0c\u51fa\u73b0\u4e0b\u5217\u7684\u6548\u679c","source":"@site/docs/issues/toast-svg-bug.md","sourceDirName":"issues","slug":"/issues/toast-svg-bug","permalink":"/weapp-tailwindcss/docs/issues/toast-svg-bug","draft":false,"unlisted":false,"editUrl":"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/issues/toast-svg-bug.md","tags":[],"version":"current","frontMatter":{},"sidebar":"issuesSidebar","previous":{"title":"\u8de8\u7aef\u5e94\u7528\u6ce8\u610f\u4e8b\u9879","permalink":"/weapp-tailwindcss/docs/multi-platform"},"next":{"title":"v1\u7248\u672c\u5e38\u89c1\u95ee\u9898","permalink":"/weapp-tailwindcss/docs/issues/v1"}}');var i=n(6106),c=n(2036);const a={},d="H5 \u7aef\u539f\u751f toast \u6837\u5f0f\u504f\u79fb\u95ee\u9898",o={},r=[];function l(s){const e={code:"code",h1:"h1",header:"header",img:"img",p:"p",pre:"pre",...(0,c.R)(),...s.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.header,{children:(0,i.jsx)(e.h1,{id:"h5-\u7aef\u539f\u751f-toast-\u6837\u5f0f\u504f\u79fb\u95ee\u9898",children:"H5 \u7aef\u539f\u751f toast \u6837\u5f0f\u504f\u79fb\u95ee\u9898"})}),"\n",(0,i.jsxs)(e.p,{children:["\u5728\u4f7f\u7528 ",(0,i.jsx)(e.code,{children:"tailwindcss"})," \u7684\u65f6\u5019\uff0c\u7f16\u8bd1\u5230 ",(0,i.jsx)(e.code,{children:"h5"})," \u5e73\u53f0\uff0c\u4f7f\u7528 ",(0,i.jsx)(e.code,{children:"uni.toast"})," / ",(0,i.jsx)(e.code,{children:"taro.toast"})," \u65f6\uff0c\u51fa\u73b0\u4e0b\u5217\u7684\u6548\u679c"]}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.img,{src:n(3414).A+"",width:"372",height:"274"})}),"\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.code,{children:"tailwindcss"})," \u7684 ",(0,i.jsx)(e.code,{children:"base"})," \u4e2d\u7684 ",(0,i.jsx)(e.code,{children:"preflight"})," \u5f71\u54cd\u8fd9\u4e2a ",(0,i.jsx)(e.code,{children:"uni.toast"})," \u7684\u6837\u5f0f"]}),"\n",(0,i.jsxs)(e.p,{children:["\u8fd9\u662f\u7531\u4e8e ",(0,i.jsx)(e.code,{children:"preflight.css"})," \u4e2d\u9ed8\u8ba4\u4f1a\u6dfb\u52a0\u4e0b\u65b9\u7684\u6837\u5f0f"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-css",children:"img,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block; /* 1 */\n  vertical-align: middle; /* 2 */\n}\n"})}),"\n",(0,i.jsxs)(e.p,{children:["\u8fd9\u5bfc\u81f4\u4e86 ",(0,i.jsx)(e.code,{children:"svg"})," \u53d8\u6210\u4e86 ",(0,i.jsx)(e.code,{children:"display: block;"})," \u7684\u72b6\u6001"]}),"\n",(0,i.jsxs)(e.p,{children:["\u89e3\u51b3\u65b9\u6848\u4e5f\u975e\u5e38\u7684\u7b80\u5355, \u5728 ",(0,i.jsx)(e.code,{children:"app.wxss"})," \u4f7f\u7528\u6837\u5f0f\u8fdb\u884c\u8986\u76d6:"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-scss",children:".uni-toast{\n  svg {\n    display: initial; // \u91cd\u65b0\u521d\u59cb\u5316 uni-toast \u91cc\u7684\u6837\u5f0f\u8fdb\u884c\u8986\u76d6 \u8986\u76d6\n  }\n}\n"})}),"\n",(0,i.jsxs)(e.p,{children:["\u5047\u5982\u4f60\u4f7f\u7528\u7684\u662f ",(0,i.jsx)(e.code,{children:"uni-app"}),"\uff0c\u90a3\u4e48\u8fd8\u53ef\u4ee5\u4f7f\u7528\u6837\u5f0f\u6761\u4ef6\u7f16\u8bd1\u7684\u65b9\u5f0f\u6765\u505a:"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-scss",children:"/*  #ifdef  H5  */\nsvg {\n  display: initial;\n}\n/*  #endif  */\n"})})]})}function p(s={}){const{wrapper:e}={...(0,c.R)(),...s.components};return e?(0,i.jsx)(e,{...s,children:(0,i.jsx)(l,{...s})}):l(s)}},3414:(s,e,n)=>{n.d(e,{A:()=>t});const t=n.p+"assets/images/toast-svg-bug-672d35d63e36c0f173e664b9a7fbc54c.jpg"},2036:(s,e,n)=>{n.d(e,{R:()=>a,x:()=>d});var t=n(7378);const i={},c=t.createContext(i);function a(s){const e=t.useContext(c);return t.useMemo((function(){return"function"==typeof s?s(e):{...e,...s}}),[e,s])}function d(s){let e;return e=s.disableParentContext?"function"==typeof s.components?s.components(i):s.components||i:a(s.components),t.createElement(c.Provider,{value:e},s.children)}}}]);