"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[6832],{7835:(e,c,n)=>{n.r(c),n.d(c,{assets:()=>r,contentTitle:()=>l,default:()=>t,frontMatter:()=>d,metadata:()=>o,toc:()=>p});var s=n(6106),i=n(874);const d={},l="\u65e7\u6709uni-app\u9879\u76ee\u5347\u7ea7webpack5\u6307\u5357",o={id:"upgrade/uni-app",title:"\u65e7\u6709uni-app\u9879\u76ee\u5347\u7ea7webpack5\u6307\u5357",description:"\u76ee\u524d uni-app \u9ed8\u8ba4\u521b\u5efa\u7684 vue2 \u9879\u76ee,\u5df2\u7ecf\u5168\u9762\u4f7f\u7528 @vue/cli-service@5 \u4e86(2023-10)\uff0c\u6240\u4ee5\u76ee\u524d\u6b63\u5e38\u5347\u7ea7\u5373\u53ef\uff0c\u672c\u6307\u5357\u5e9f\u5f03! \u7559\u4f5c\u5f52\u6863\u5904\u7406",source:"@site/docs/upgrade/uni-app.md",sourceDirName:"upgrade",slug:"/upgrade/uni-app",permalink:"/weapp-tailwindcss/docs/upgrade/uni-app",draft:!1,unlisted:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/upgrade/uni-app.md",tags:[],version:"current",frontMatter:{},sidebar:"migrationsSidebar",previous:{title:"\u4ece v1 \u8fc1\u79fb\u5230 v2",permalink:"/weapp-tailwindcss/docs/migrations/v1"},next:{title:"What's new in v2",permalink:"/weapp-tailwindcss/docs/releases/v2"}},r={},p=[{value:"1. \u5347\u7ea7 <code>@dcloudio/*</code> \u76f8\u5173\u7684\u5305",id:"1-\u5347\u7ea7-dcloudio-\u76f8\u5173\u7684\u5305",level:3},{value:"2. \u5347\u7ea7 <code>@vue/cli-*</code> \u76f8\u5173\u7684\u5305",id:"2-\u5347\u7ea7-vuecli--\u76f8\u5173\u7684\u5305",level:3},{value:"3. \u5347\u7ea7\u4f60\u6240\u6709\u7684 <code>webpack</code> <code>plugin</code> \u548c <code>loader</code>",id:"3-\u5347\u7ea7\u4f60\u6240\u6709\u7684-webpack-plugin-\u548c-loader",level:3},{value:"4. \u914d\u7f6e\u6587\u4ef6\u5347\u7ea7",id:"4-\u914d\u7f6e\u6587\u4ef6\u5347\u7ea7",level:3},{value:"5. \u8fd0\u884c\u6392\u9519",id:"5-\u8fd0\u884c\u6392\u9519",level:3}];function a(e){const c={a:"a",admonition:"admonition",code:"code",h1:"h1",h3:"h3",header:"header",p:"p",pre:"pre",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(c.header,{children:(0,s.jsx)(c.h1,{id:"\u65e7\u6709uni-app\u9879\u76ee\u5347\u7ea7webpack5\u6307\u5357",children:"\u65e7\u6709uni-app\u9879\u76ee\u5347\u7ea7webpack5\u6307\u5357"})}),"\n",(0,s.jsxs)(c.admonition,{type:"caution",children:[(0,s.jsxs)(c.p,{children:["\u76ee\u524d ",(0,s.jsx)(c.code,{children:"uni-app"})," \u9ed8\u8ba4\u521b\u5efa\u7684 ",(0,s.jsx)(c.code,{children:"vue2"})," \u9879\u76ee,\u5df2\u7ecf\u5168\u9762\u4f7f\u7528 ",(0,s.jsx)(c.code,{children:"@vue/cli-service@5"})," \u4e86(2023-10)\uff0c\u6240\u4ee5\u76ee\u524d\u6b63\u5e38\u5347\u7ea7\u5373\u53ef\uff0c\u672c\u6307\u5357\u5e9f\u5f03! \u7559\u4f5c\u5f52\u6863\u5904\u7406"]}),(0,s.jsx)(c.p,{children:"\u4f7f\u7528 uni-app vite vue3 \u7684\u5f00\u53d1\u8005\u53ef\u4ee5\u5ffd\u7565\u6b64\u6307\u5357"})]}),"\n",(0,s.jsxs)(c.p,{children:["\u7531\u4e8e\u76ee\u524d ",(0,s.jsx)(c.code,{children:"uni-app"})," ",(0,s.jsx)(c.code,{children:"hbuilderx"}),"\u548c",(0,s.jsx)(c.code,{children:"cli"}),"\u9ed8\u8ba4\u521b\u5efa\u7684 ",(0,s.jsx)(c.code,{children:"vue2"})," \u9879\u76ee\uff0c\u8fd8\u662f\u4f7f\u7528\u7684 ",(0,s.jsx)(c.code,{children:"@vue/cli-service@4"})]}),"\n",(0,s.jsxs)(c.p,{children:["\u4e3a\u4e86\u4f7f\u7528\u66f4\u5148\u8fdb\u66f4\u6709\u751f\u4ea7\u529b\u7684 ",(0,s.jsx)(c.code,{children:"webpack5"})," \u548c ",(0,s.jsx)(c.code,{children:"postcss8"})," \u6211\u4eec\u5fc5\u987b\u8981\u5347\u7ea7\u5230 ",(0,s.jsx)(c.code,{children:"@vue/cli-service@5"})]}),"\n",(0,s.jsx)(c.p,{children:"\u90a3\u4e48\u65e7\u6709\u7684\u8001\u9879\u76ee\u5e94\u8be5\u5982\u4f55\u5347\u7ea7\u5462\uff1f"}),"\n",(0,s.jsxs)(c.h3,{id:"1-\u5347\u7ea7-dcloudio-\u76f8\u5173\u7684\u5305",children:["1. \u5347\u7ea7 ",(0,s.jsx)(c.code,{children:"@dcloudio/*"})," \u76f8\u5173\u7684\u5305"]}),"\n",(0,s.jsx)(c.p,{children:"\u5728\u9879\u76ee\u6839\u76ee\u5f55\uff0c\u6267\u884c:"}),"\n",(0,s.jsx)(c.pre,{children:(0,s.jsx)(c.code,{className:"language-bash",children:"npx @dcloudio/uvm alpha\n"})}),"\n",(0,s.jsxs)(c.p,{children:["\u7136\u540e\u9009\u62e9 ",(0,s.jsx)(c.code,{children:"y"})," \u540e\uff0c\u51fa\u73b0\u63d0\u793a\uff0c\u9009\u62e9\u4f60\u9879\u76ee\u4f7f\u7528\u7684\u5305\u7ba1\u7406\u5668\uff0c\u8fd0\u884c\u5373\u53ef\u3002"]}),"\n",(0,s.jsxs)(c.p,{children:["\u6b64\u65f6\u4f60\u6240\u6709\u7684 ",(0,s.jsx)(c.code,{children:"@dcloudio/*"})," \u76f8\u5173\u7684\u5305\uff0c\u88ab\u5347\u7ea7\u5230\u4e86 ",(0,s.jsx)(c.code,{children:"2.0.2-alpha-xxxxxxxxxxxx"})," \u7684\u7248\u672c\u3002"]}),"\n",(0,s.jsxs)(c.h3,{id:"2-\u5347\u7ea7-vuecli--\u76f8\u5173\u7684\u5305",children:["2. \u5347\u7ea7 ",(0,s.jsx)(c.code,{children:"@vue/cli-*"})," \u76f8\u5173\u7684\u5305"]}),"\n",(0,s.jsxs)(c.p,{children:["\u4f7f\u7528\u4f60\u7684\u5305\u7ba1\u7406\u5668\uff0c\u5347\u7ea7 ",(0,s.jsx)(c.code,{children:"@vue/*"}),",",(0,s.jsx)(c.code,{children:"@vue/cli-*"})," \u76f8\u5173\u7684\u5305\u5230 ",(0,s.jsx)(c.code,{children:"5.x"})," \u7248\u672c\u3002"]}),"\n",(0,s.jsx)(c.pre,{children:(0,s.jsx)(c.code,{className:"language-json",children:'{\n  "@vue/babel-preset-app": "^5.0.8",\n  "@vue/cli-plugin-babel": "~5.0.8",\n  "@vue/cli-plugin-typescript": "5.0.8",\n  "@vue/cli-service": "~5.0.8",\n}\n'})}),"\n",(0,s.jsxs)(c.h3,{id:"3-\u5347\u7ea7\u4f60\u6240\u6709\u7684-webpack-plugin-\u548c-loader",children:["3. \u5347\u7ea7\u4f60\u6240\u6709\u7684 ",(0,s.jsx)(c.code,{children:"webpack"})," ",(0,s.jsx)(c.code,{children:"plugin"})," \u548c ",(0,s.jsx)(c.code,{children:"loader"})]}),"\n",(0,s.jsxs)(c.p,{children:["\u7531\u4e8e\u4f60\u4f7f\u7528\u4e86\u6700\u65b0\u7248\u672c\u7684 ",(0,s.jsx)(c.code,{children:"webpack"})," \u4f60\u53ef\u4ee5\u628a\u90a3\u4e9b\u76f8\u5173\u7684\u5305\uff0c\u5347\u7ea7\u5230\u6700\u65b0\u7684\u7248\u672c\uff0c"]}),"\n",(0,s.jsxs)(c.p,{children:["\u6bd4\u5982 ",(0,s.jsx)(c.code,{children:"sass-loader"}),", ",(0,s.jsx)(c.code,{children:"copy-webpack-plugin"})," \u7b49\u7b49"]}),"\n",(0,s.jsxs)(c.p,{children:["\u800c\u4e14\u7531\u4e8e\u4f60\u4f7f\u7528\u4e86 ",(0,s.jsx)(c.code,{children:"5.x"})," \u7248\u672c\u7684 ",(0,s.jsx)(c.code,{children:"@vue/cli"}),"\uff0c\u91cc\u9762\u9ed8\u8ba4\u4f9d\u8d56\u4e86 ",(0,s.jsx)(c.code,{children:"postcss8"})]}),"\n",(0,s.jsxs)(c.p,{children:["\u6240\u4ee5\u4f60\u4e5f\u6309\u9700\u5e94\u8be5\u5347\u7ea7\u4e00\u4e0b\u4f60\u6240\u4f9d\u8d56\u7684 ",(0,s.jsx)(c.code,{children:"postcss"})," \u63d2\u4ef6\u7248\u672c\u3002"]}),"\n",(0,s.jsx)(c.h3,{id:"4-\u914d\u7f6e\u6587\u4ef6\u5347\u7ea7",children:"4. \u914d\u7f6e\u6587\u4ef6\u5347\u7ea7"}),"\n",(0,s.jsxs)(c.p,{children:["\u6bd4\u5982 ",(0,s.jsx)(c.code,{children:"babel.config.js"})," \u8fd9\u4e2a\u5c31\u9700\u8981\u4fee\u6539\uff0c",(0,s.jsx)(c.a,{href:"https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app-webpack5/babel.config.js",children:"\u53c2\u8003\u4ee3\u7801"})]}),"\n",(0,s.jsxs)(c.p,{children:["\u6bd4\u5982 ",(0,s.jsx)(c.code,{children:"postcss.config.js"})," \u8fd9\u4e2a\uff0c\u4e5f\u9700\u8981\u66f4\u65b0\u4e00\u4e0b\uff0c",(0,s.jsx)(c.a,{href:"https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app-webpack5/postcss.config.js",children:"\u53c2\u8003\u4ee3\u7801"})]}),"\n",(0,s.jsxs)(c.p,{children:["\u8bf8\u5982\u8fd9\u79cd\u7c7b\u4f3c\u7684\uff0c\u90fd\u53ef\u4ee5\u65b0\u521b\u5efa\u4e00\u4e2a\u7684 ",(0,s.jsx)(c.code,{children:"uni-app alpha"})," \u7684\u9879\u76ee\uff0c\u7136\u540e\u628a\u91cc\u9762\u7684\u914d\u7f6e\u76f4\u63a5\u590d\u5236\u8fc7\u6765\uff0c\u518d\u6539\u6539 ",(0,s.jsx)(c.code,{children:"postcss.config.js"})," \u628a ",(0,s.jsx)(c.code,{children:"tailwindcss"})," \u6ce8\u518c\u8fdb\u53bb\u5373\u53ef\u3002"]}),"\n",(0,s.jsx)(c.h3,{id:"5-\u8fd0\u884c\u6392\u9519",children:"5. \u8fd0\u884c\u6392\u9519"}),"\n",(0,s.jsxs)(c.p,{children:["\u63a5\u4e0b\u6765\u5c31\u662f\uff0c\u5220\u6389\u4f60\u7684 ",(0,s.jsx)(c.code,{children:"lock"})," \u6587\u4ef6\uff0c\u91cd\u65b0\u5b89\u88c5\u6240\u6709\u5305\uff0c\u5e76\u8fd0\u884c\u4f60\u7684\u9879\u76ee\uff01"]}),"\n",(0,s.jsxs)(c.p,{children:["\u5f53\u7136\u8fd0\u884c\u65f6\uff0c\u5f88\u6709\u53ef\u80fd\u62a5\u5404\u79cd\u5404\u6837\u7684\u9519\u8bef: \u6bd4\u5982 ",(0,s.jsx)(c.code,{children:"babel-xxx"})," \u63d2\u4ef6\u627e\u4e0d\u5230\uff0c\u8fd9\u79cd\u5b89\u88c5\u5373\u53ef\u3002"]}),"\n",(0,s.jsxs)(c.p,{children:["\u6216\u8005\u4ec0\u4e48 ",(0,s.jsx)(c.code,{children:"webpack"})," \u63d2\u4ef6\u62a5\u9519\uff0c\u8fd9\u79cd\u53ef\u4ee5\u6682\u65f6\u53bb\u9664\u770b\u770b\u80fd\u4e0d\u80fd\u6253\u5305\u6210\u529f\u3002"]}),"\n",(0,s.jsxs)(c.admonition,{type:"tip",children:[(0,s.jsxs)(c.p,{children:["\u5047\u5982\u4f60\u4f7f\u7528\u4e86 ",(0,s.jsx)(c.code,{children:"uni-app"})," \u7684\u540c\u65f6\u4f7f\u7528\u4e86\u4e91\u51fd\u6570\uff0c\u4e91\u51fd\u6570\u5bfc\u81f4\u7f16\u8bd1\u5230\u5fae\u4fe1\u51fa\u73b0 ",(0,s.jsx)(c.code,{children:"TypeError: I18n is not a constructor"})]}),(0,s.jsxs)(c.p,{children:["\u89e3\u51b3\u65b9\u6848\u8be6\u60c5\u89c1: ",(0,s.jsx)(c.a,{href:"https://ask.dcloud.net.cn/question/170057",children:"https://ask.dcloud.net.cn/question/170057"})]}),(0,s.jsxs)(c.p,{children:["\u76f8\u5173 issue : ",(0,s.jsx)(c.a,{href:"https://github.com/sonofmagic/weapp-tailwindcss/issues/74#issuecomment-1573033475",children:"issues/74#issuecomment-1573033475"})]})]})]})}function t(e={}){const{wrapper:c}={...(0,i.R)(),...e.components};return c?(0,s.jsx)(c,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},874:(e,c,n)=>{n.d(c,{R:()=>l,x:()=>o});var s=n(7378);const i={},d=s.createContext(i);function l(e){const c=s.useContext(d);return s.useMemo((function(){return"function"==typeof e?e(c):{...c,...e}}),[c,e])}function o(e){let c;return c=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:l(e.components),s.createElement(d.Provider,{value:c},e.children)}}}]);