"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[7186],{4149:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>a,contentTitle:()=>r,default:()=>d,frontMatter:()=>s,metadata:()=>p,toc:()=>o});var t=i(6106),c=i(9252);const s={},r="uni-app cli vue2 webpack",p={id:"quick-start/frameworks/uni-app",title:"uni-app cli vue2 webpack",description:"\u8fd9\u662f uni-app cli \u521b\u5efa\u7684\u9879\u76ee\u7684\u6ce8\u518c\u65b9\u5f0f\uff0c\u5982\u679c\u4f60\u4f7f\u7528 HbuilderX\uff0c\u5e94\u8be5\u67e5\u770b uni-app HbuilderX \u4f7f\u7528\u65b9\u5f0f",source:"@site/docs/quick-start/frameworks/uni-app.md",sourceDirName:"quick-start/frameworks",slug:"/quick-start/frameworks/uni-app",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/uni-app",draft:!1,unlisted:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/frameworks/uni-app.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"2. \u5b89\u88c5\u8fd9\u4e2a\u63d2\u4ef6",permalink:"/weapp-tailwindcss/docs/quick-start/this-plugin"},next:{title:"uni-app cli vue3 vite",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/uni-app-vite"}},a={},o=[];function u(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",p:"p",pre:"pre",...(0,c.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h1,{id:"uni-app-cli-vue2-webpack",children:"uni-app cli vue2 webpack"}),"\n",(0,t.jsx)(n.admonition,{type:"warning",children:(0,t.jsxs)(n.p,{children:["\u8fd9\u662f ",(0,t.jsx)(n.code,{children:"uni-app cli"})," \u521b\u5efa\u7684\u9879\u76ee\u7684\u6ce8\u518c\u65b9\u5f0f\uff0c\u5982\u679c\u4f60\u4f7f\u7528 ",(0,t.jsx)(n.code,{children:"HbuilderX"}),"\uff0c\u5e94\u8be5\u67e5\u770b ",(0,t.jsx)(n.a,{href:"/docs/quick-start/frameworks/hbuilderx",children:"uni-app HbuilderX \u4f7f\u7528\u65b9\u5f0f"})]})}),"\n",(0,t.jsxs)(n.admonition,{type:"tip",children:[(0,t.jsxs)(n.p,{children:["\u622a\u6b62\u5230 (2023/09/08)\uff0c\u76ee\u524d\u6240\u6709\u7684 ",(0,t.jsx)(n.code,{children:"uni-app vue2 cli"})," \u9879\u76ee\u7684 ",(0,t.jsx)(n.code,{children:"webpack"})," \u7248\u672c\uff0c\u5df2\u7ecf\u5207\u6362\u5230\u4e86 ",(0,t.jsx)(n.code,{children:"webpack@5"}),"\uff0c",(0,t.jsx)(n.code,{children:"@vue/cli@5"}),"\uff0c",(0,t.jsx)(n.code,{children:"postcss@8"})," \u4e86"]}),(0,t.jsxs)(n.p,{children:["\u53e6\u5916\u5982\u679c\u4f60\u6709\u65e7\u6709\u7684 ",(0,t.jsx)(n.code,{children:"uni-app webpack4"})," \u9879\u76ee\u9700\u8981\u8fc1\u79fb\u5230 ",(0,t.jsx)(n.code,{children:"webpack5"}),"\uff0c\u53ef\u4ee5\u770b\u8fd9\u7bc7 ",(0,t.jsx)(n.a,{href:"/docs/upgrade/uni-app",children:"\u65e7\u6709uni-app\u9879\u76ee\u5347\u7ea7webpack5\u6307\u5357"})]})]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",metastring:'title="vue.config.js"',children:"const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')\n/**\n * @type {import('@vue/cli-service').ProjectOptions}\n */\nconst config = {\n  // some option...\n  // highlight-start\n  configureWebpack: (config) => {\n    config.plugins.push(\n      new UnifiedWebpackPluginV5({\n        appType: 'uni-app'\n      })\n    )\n  }\n  // highlight-end\n  // other option...\n}\n\nmodule.exports = config\n"})}),"\n",(0,t.jsx)(n.p,{children:"\u8fd9\u6837\u6240\u6709\u7684\u914d\u7f6e\u4fbf\u5b8c\u6210\u4e86\uff01\u8d76\u7d27\u542f\u52a8\u4f60\u7684\u9879\u76ee\u8bd5\u8bd5\u5427\uff01"})]})}function d(e={}){const{wrapper:n}={...(0,c.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(u,{...e})}):u(e)}},9252:(e,n,i)=>{i.d(n,{R:()=>r,x:()=>p});var t=i(7378);const c={},s=t.createContext(c);function r(e){const n=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function p(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:r(e.components),t.createElement(s.Provider,{value:n},e.children)}}}]);