"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[5816],{1496:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>r,contentTitle:()=>d,default:()=>p,frontMatter:()=>t,metadata:()=>l,toc:()=>a});var i=n(6106),c=n(9252);const t={},d="\u539f\u751f\u5f00\u53d1(\u6253\u5305\u65b9\u6848)",l={id:"quick-start/frameworks/native",title:"\u539f\u751f\u5f00\u53d1(\u6253\u5305\u65b9\u6848)",description:"\u6ce8\u610f\uff01\u8fd9\u662f\u539f\u751f\u5f00\u53d1(\u6253\u5305\u65b9\u6848)\uff0c\u5047\u5982\u4f60\u9700\u8981\u7eaf\u539f\u751f\u65b9\u6848\uff0c\u8bf7\u67e5\u770b \u5feb\u901f\u5f00\u59cb(\u7eaf\u539f\u751f)",source:"@site/docs/quick-start/frameworks/native.md",sourceDirName:"quick-start/frameworks",slug:"/quick-start/frameworks/native",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/native",draft:!1,unlisted:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/frameworks/native.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"mpx (\u539f\u751f\u589e\u5f3a)",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/mpx"},next:{title:"Nodejs API",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/api"}},r={},a=[{value:"gulp \u6a21\u677f",id:"gulp-\u6a21\u677f",level:2},{value:"webpack5 \u6a21\u677f",id:"webpack5-\u6a21\u677f",level:2},{value:"\u7ec4\u4ef6\u6837\u5f0f\u7684\u9694\u79bb\u6027",id:"\u7ec4\u4ef6\u6837\u5f0f\u7684\u9694\u79bb\u6027",level:2},{value:"vscode tailwindcss \u667a\u80fd\u63d0\u793a\u8bbe\u7f6e",id:"vscode-tailwindcss-\u667a\u80fd\u63d0\u793a\u8bbe\u7f6e",level:2}];function o(e){const s={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",...(0,c.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.h1,{id:"\u539f\u751f\u5f00\u53d1\u6253\u5305\u65b9\u6848",children:"\u539f\u751f\u5f00\u53d1(\u6253\u5305\u65b9\u6848)"}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:["\u6ce8\u610f\uff01\u8fd9\u662f\u539f\u751f\u5f00\u53d1(\u6253\u5305\u65b9\u6848)\uff0c\u5047\u5982\u4f60\u9700\u8981\u7eaf\u539f\u751f\u65b9\u6848\uff0c\u8bf7\u67e5\u770b ",(0,i.jsx)(s.a,{href:"/docs/quick-start/native/install",children:"\u5feb\u901f\u5f00\u59cb(\u7eaf\u539f\u751f)"})]}),"\n"]}),"\n",(0,i.jsxs)(s.p,{children:["\u7531\u4e8e\u539f\u751f\u5c0f\u7a0b\u5e8f\u6ca1\u6709 ",(0,i.jsx)(s.code,{children:"webpack/vite/gulp"})," \u5de5\u5177\u94fe\uff0c\u6240\u4ee5\u6211\u4eec\u8981\u6dfb\u52a0\u8fd9\u4e00\u5957\u673a\u5236\uff0c\u6765\u6574\u4e2a\u524d\u7aef\u793e\u533a\u63a5\u8f68\uff0c\u4ee5\u6b64\u6765\u5b9e\u73b0\u66f4\u5f3a\u5927\u7684\u529f\u80fd\u3002"]}),"\n",(0,i.jsxs)(s.admonition,{type:"tip",children:[(0,i.jsxs)(s.p,{children:["\u7ed9\u539f\u751f\u5c0f\u7a0b\u5e8f\u52a0\u5165\u7f16\u8bd1\u65f6\u8fd9\u5757 ",(0,i.jsx)(s.code,{children:"webpack/vite/gulp"})," \u7b49\u7b49\u5de5\u5177\uff0c\u601d\u8def\u90fd\u662f\u4e00\u6837\u7684\uff0c\u7136\u800c\u5b9e\u73b0\u8d77\u6765\u6bd4\u8f83\u590d\u6742\uff0c\u635f\u8017\u7cbe\u529b\uff0c\u5728\u6b64\u4e0d\u63d0\u53ca\u539f\u7406\u3002"]}),(0,i.jsx)(s.p,{children:"\u66f4\u6539\u6a21\u677f\u5de5\u5177\u94fe\u6d41\u7a0b\u524d\uff0c\u8bf7\u786e\u4fdd\u4f60\u6bd4\u8f83\u719f\u6089\u5de5\u5177\u94fe\u5f00\u53d1\uff08\u5230\u6211\u8fd9\u6837\u7684\u6c34\u5e73\u5c31\u5dee\u4e0d\u591a\u4e86\uff09\u3002"}),(0,i.jsxs)(s.p,{children:["\u53e6\u5916\u8fd9\u4e9b\u6a21\u677f\uff0c\u53ea\u9700\u8981\u7a0d\u5fae\u6539\u4e00\u4e0b\u4ea7\u7269\u540e\u7f00\uff0c\u6dfb\u52a0 ",(0,i.jsx)(s.code,{children:"tailwind.config.js"})," \u7684 ",(0,i.jsx)(s.code,{children:"content"})," \u5c31\u53ef\u4ee5\u9002\u914d\u767e\u5ea6\uff0c\u5934\u6761\uff0c\u4eac\u4e1c...\u5404\u4e2a\u5e73\u53f0\u3002"]})]}),"\n",(0,i.jsx)(s.h2,{id:"gulp-\u6a21\u677f",children:"gulp \u6a21\u677f"}),"\n",(0,i.jsxs)(s.p,{children:["\u6a21\u677f\u9879\u76ee ",(0,i.jsx)(s.a,{href:"https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/gulp-app",children:"weapp-tailwindcss-gulp-template(gulp\u6253\u5305)"})]}),"\n",(0,i.jsx)(s.h2,{id:"webpack5-\u6a21\u677f",children:"webpack5 \u6a21\u677f"}),"\n",(0,i.jsxs)(s.p,{children:["\u6a21\u677f\u9879\u76ee ",(0,i.jsx)(s.a,{href:"https://github.com/sonofmagic/weapp-native-mina-tailwindcss-template",children:"weapp-native-mina-tailwindcss-template(webpack\u6253\u5305)"})]}),"\n",(0,i.jsx)(s.h2,{id:"\u7ec4\u4ef6\u6837\u5f0f\u7684\u9694\u79bb\u6027",children:"\u7ec4\u4ef6\u6837\u5f0f\u7684\u9694\u79bb\u6027"}),"\n",(0,i.jsxs)(s.admonition,{type:"tip",children:[(0,i.jsx)(s.p,{children:"\u53d1\u73b0\u5f88\u591a\u7528\u6237\uff0c\u5728\u4f7f\u7528\u539f\u751f\u5f00\u53d1\u7684\u65f6\u5019\uff0c\u7ecf\u5e38\u4f1a\u95ee\uff0c\u4e3a\u4ec0\u4e48\u6837\u5f0f\u4e0d\u751f\u6548\u3002"}),(0,i.jsx)(s.p,{children:"\u8fd9\u53ef\u80fd\u6709\u4ee5\u4e0b\u51e0\u4e2a\u539f\u56e0:"}),(0,i.jsxs)(s.ol,{children:["\n",(0,i.jsxs)(s.li,{children:["\u4ee3\u7801\u6587\u4ef6\u4e0d\u5728 ",(0,i.jsx)(s.code,{children:"tailwind.config.js"})," \u7684 ",(0,i.jsx)(s.code,{children:"content"})," \u914d\u7f6e\u5185"]}),"\n",(0,i.jsxs)(s.li,{children:["\u539f\u751f\u5c0f\u7a0b\u5e8f\u7ec4\u4ef6\u662f\u9ed8\u8ba4\u5f00\u542f ",(0,i.jsx)(s.strong,{children:"\u7ec4\u4ef6\u6837\u5f0f\u9694\u79bb"})," \u7684\uff0c\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0c\u81ea\u5b9a\u4e49\u7ec4\u4ef6\u7684\u6837\u5f0f\u53ea\u53d7\u5230\u81ea\u5b9a\u4e49\u7ec4\u4ef6 wxss \u7684\u5f71\u54cd\u3002\u800c ",(0,i.jsx)(s.code,{children:"tailwindcss"})," \u751f\u6210\u7684\u5de5\u5177\u7c7b\uff0c\u90fd\u5728 ",(0,i.jsx)(s.code,{children:"app.wxss"})," \u8fd9\u4e2a\u5168\u5c40\u6837\u5f0f\u6587\u4ef6\u91cc\u9762\u3002\u4e0d\u5c5e\u4e8e\u7ec4\u4ef6\u5185\u90e8\uff0c\u81ea\u7136\u4e0d\u751f\u6548\u3002"]}),"\n"]}),(0,i.jsx)(s.p,{children:"\u8fd9\u65f6\u5019\u53ef\u4ee5\u4f7f\u7528:"}),(0,i.jsx)(s.pre,{children:(0,i.jsx)(s.code,{className:"language-js",children:"/* \u7ec4\u4ef6 custom-component.js */\nComponent({\n  options: {\n    addGlobalClass: true,\n  }\n})\n"})}),(0,i.jsxs)(s.p,{children:["\u6765\u8ba9\u7ec4\u4ef6\u5e94\u7528\u5230 ",(0,i.jsx)(s.code,{children:"app.wxss"})," \u91cc\u7684\u6837\u5f0f\u3002"]}),(0,i.jsx)(s.p,{children:(0,i.jsx)(s.a,{href:"https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html#%E7%BB%84%E4%BB%B6%E6%A0%B7%E5%BC%8F%E9%9A%94%E7%A6%BB",children:"\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u76f8\u5173\u5f00\u53d1\u6587\u6863"})})]}),"\n",(0,i.jsx)(s.h2,{id:"vscode-tailwindcss-\u667a\u80fd\u63d0\u793a\u8bbe\u7f6e",children:"vscode tailwindcss \u667a\u80fd\u63d0\u793a\u8bbe\u7f6e"}),"\n",(0,i.jsxs)(s.p,{children:["\u6211\u4eec\u77e5\u9053 ",(0,i.jsx)(s.code,{children:"tailwindcss"})," \u6700\u4f73\u5b9e\u8df5\uff0c\u662f\u8981\u7ed3\u5408 ",(0,i.jsx)(s.code,{children:"vscode"}),"/",(0,i.jsx)(s.code,{children:"webstorm"}),"\u63d0\u793a\u63d2\u4ef6\u4e00\u8d77\u4f7f\u7528\u7684\u3002"]}),"\n",(0,i.jsxs)(s.p,{children:["\u5047\u5982\u4f60\u9047\u5230\u4e86\uff0c\u5728 ",(0,i.jsx)(s.code,{children:"vscode"})," \u7684 ",(0,i.jsx)(s.code,{children:"wxml"})," \u6587\u4ef6\u4e2d\uff0c\u7f16\u5199 ",(0,i.jsx)(s.code,{children:"class"})," \u6ca1\u6709\u51fa\u667a\u80fd\u63d0\u793a\u7684\u60c5\u51b5\uff0c\u53ef\u4ee5\u53c2\u8003\u4ee5\u4e0b\u6b65\u9aa4\u3002"]}),"\n",(0,i.jsxs)(s.p,{children:["\u8fd9\u91cc\u6211\u4eec\u4ee5 ",(0,i.jsx)(s.code,{children:"vscode"})," \u4e3a\u4f8b:"]}),"\n",(0,i.jsxs)(s.ol,{children:["\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["\u5b89\u88c5 ",(0,i.jsx)(s.a,{href:"https://marketplace.visualstudio.com/items?itemName=qiu8310.minapp-vscode",children:(0,i.jsx)(s.code,{children:"WXML - Language Services \u63d2\u4ef6"})}),"(\u4e00\u641c wxml \u4e0b\u8f7d\u91cf\u6700\u591a\u7684\u5c31\u662f\u4e86)"]}),"\n"]}),"\n",(0,i.jsxs)(s.li,{children:["\n",(0,i.jsxs)(s.p,{children:["\u5b89\u88c5 ",(0,i.jsx)(s.a,{href:"https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss",children:(0,i.jsx)(s.code,{children:"Tailwind CSS IntelliSense \u63d2\u4ef6"})})]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(s.p,{children:["\u63a5\u7740\u627e\u5230 ",(0,i.jsx)(s.code,{children:"Tailwind CSS IntelliSense"})," \u7684 ",(0,i.jsx)(s.code,{children:"\u6269\u5c55\u8bbe\u7f6e"})]}),"\n",(0,i.jsxs)(s.p,{children:["\u5728 ",(0,i.jsx)(s.code,{children:"include languages"}),",\u624b\u52a8\u6807\u8bb0 ",(0,i.jsx)(s.code,{children:"wxml"})," \u7684\u7c7b\u578b\u4e3a ",(0,i.jsx)(s.code,{children:"html"})]}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.img,{alt:"\u5982\u56fe\u6240\u793a",src:n(8272).A+"",width:"981",height:"518"})}),"\n",(0,i.jsx)(s.p,{children:"\u667a\u80fd\u63d0\u793a\u5c31\u51fa\u6765\u4e86:"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.img,{alt:"\u667a\u80fd\u63d0\u793a",src:n(8913).A+"",width:"427",height:"265"})})]})}function p(e={}){const{wrapper:s}={...(0,c.R)(),...e.components};return s?(0,i.jsx)(s,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},8272:(e,s,n)=>{n.d(s,{A:()=>i});const i=n.p+"assets/images/vscode-setting-1d92abd9177ac2070958503b101947f1.png"},8913:(e,s,n)=>{n.d(s,{A:()=>i});const i=n.p+"assets/images/wxml-i-b89bf7066b243324a723612e36d17681.png"},9252:(e,s,n)=>{n.d(s,{R:()=>d,x:()=>l});var i=n(7378);const c={},t=i.createContext(c);function d(e){const s=i.useContext(t);return i.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function l(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:d(e.components),i.createElement(t.Provider,{value:s},e.children)}}}]);