"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[1621],{7942:(e,n,t)=>{t.d(n,{Zo:()=>d,kt:()=>k});var i=t(959);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function p(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,i,a=function(e,n){if(null==e)return{};var t,i,a={},l=Object.keys(e);for(i=0;i<l.length;i++)t=l[i],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)t=l[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var r=i.createContext({}),o=function(e){var n=i.useContext(r),t=n;return e&&(t="function"==typeof e?e(n):p(p({},n),e)),t},d=function(e){var n=o(e.components);return i.createElement(r.Provider,{value:n},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},m=i.forwardRef((function(e,n){var t=e.components,a=e.mdxType,l=e.originalType,r=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),c=o(t),m=a,k=c["".concat(r,".").concat(m)]||c[m]||u[m]||l;return t?i.createElement(k,p(p({ref:n},d),{},{components:t})):i.createElement(k,p({ref:n},d))}));function k(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var l=t.length,p=new Array(l);p[0]=m;var s={};for(var r in n)hasOwnProperty.call(n,r)&&(s[r]=n[r]);s.originalType=e,s[c]="string"==typeof e?e:a,p[1]=s;for(var o=2;o<l;o++)p[o]=t[o];return i.createElement.apply(null,p)}return i.createElement.apply(null,t)}m.displayName="MDXCreateElement"},763:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>r,contentTitle:()=>p,default:()=>u,frontMatter:()=>l,metadata:()=>s,toc:()=>o});var i=t(8028),a=(t(959),t(7942));const l={},p="tailwindcss \u591a\u4e0a\u4e0b\u6587\u4e0e\u72ec\u7acb\u5206\u5305",s={unversionedId:"quick-start/independent-pkg",id:"quick-start/independent-pkg",title:"tailwindcss \u591a\u4e0a\u4e0b\u6587\u4e0e\u72ec\u7acb\u5206\u5305",description:"\u4f60\u770b\u8fc7\u52a8\u6f2b\u300a\u767e\u517d\u738b\u300b\u5417\uff1f\u300a\u767e\u517d\u738b\u300b\u7684\u4e3b\u4eba\u516c\u662f\u4e94\u4e2a\u98de\u884c\u5458\uff0c\u4ed6\u4eec\u5206\u522b\u9a7e\u9a76\u9ed1\u3001\u7ea2\u3001\u9752\u3001\u9ec4\u3001\u7eff\u4e94\u5934\u673a\u5668\u72ee\uff0c\u5b83\u4eec\u5e73\u65f6\u53ef\u4ee5\u5355\u72ec\u8fdb\u884c\u4f5c\u6218\uff0c\u9047\u5230\u5f3a\u654c\u65f6\uff0c\u4e5f\u80fd\u8fdb\u884c\u4e94\u72ee\u5408\u4f53\uff0c\u6210\u4e3a\u5de8\u5927\u673a\u5668\u4eba\u201c\u767e\u517d\u738b\u201d\u3002",source:"@site/docs/quick-start/independent-pkg.md",sourceDirName:"quick-start",slug:"/quick-start/independent-pkg",permalink:"/weapp-tailwindcss/docs/quick-start/independent-pkg",draft:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/dev/website/docs/quick-start/independent-pkg.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"\u6784\u5efa\u4ee5\u53ca\u5f15\u5165\u5916\u90e8\u7ec4\u4ef6",permalink:"/weapp-tailwindcss/docs/quick-start/build-or-import-outside-components"},next:{title:"\u8de8\u7aef\u6ce8\u610f\u4e8b\u9879",permalink:"/weapp-tailwindcss/docs/multi-platform"}},r={},o=[{value:"\u4ec0\u4e48\u662f\u72ec\u7acb\u5206\u5305",id:"\u4ec0\u4e48\u662f\u72ec\u7acb\u5206\u5305",level:2},{value:"\u521b\u5efa\u4e0e\u914d\u7f6e\u793a\u4f8b",id:"\u521b\u5efa\u4e0e\u914d\u7f6e\u793a\u4f8b",level:2},{value:"\u5355 <code>tailwindcss</code> \u4e0a\u4e0b\u6587\u7684\u65b9\u6848\uff08\u4e0d\u5b8c\u7f8e\u4e0d\u63a8\u8350\uff09",id:"\u5355-tailwindcss-\u4e0a\u4e0b\u6587\u7684\u65b9\u6848\u4e0d\u5b8c\u7f8e\u4e0d\u63a8\u8350",level:2},{value:"\u591a <code>tailwindcss</code> \u4e0a\u4e0b\u6587\u7684\u65b9\u6848",id:"\u591a-tailwindcss-\u4e0a\u4e0b\u6587\u7684\u65b9\u6848",level:2},{value:"\u521b\u5efa\u591a\u4e2a <code>tailwind.config.js</code>",id:"\u521b\u5efa\u591a\u4e2a-tailwindconfigjs",level:3},{value:"\u72ec\u7acb\u5206\u5305\u7684\u4e0a\u4e0b\u6587\u914d\u7f6e",id:"\u72ec\u7acb\u5206\u5305\u7684\u4e0a\u4e0b\u6587\u914d\u7f6e",level:4},{value:"\u4e3b\u5305\u4ee5\u53ca\u76f8\u4e92\u4f9d\u8d56\u7684\u5b50\u5305\u7684\u4e0a\u4e0b\u6587\u914d\u7f6e",id:"\u4e3b\u5305\u4ee5\u53ca\u76f8\u4e92\u4f9d\u8d56\u7684\u5b50\u5305\u7684\u4e0a\u4e0b\u6587\u914d\u7f6e",level:4},{value:"<code>postcss.config.js</code> \u914d\u7f6e",id:"postcssconfigjs-\u914d\u7f6e",level:3},{value:"\u5c3e\u8a00",id:"\u5c3e\u8a00",level:2},{value:"\u53c2\u8003\u793a\u4f8b",id:"\u53c2\u8003\u793a\u4f8b",level:2}],d={toc:o},c="wrapper";function u(e){let{components:n,...t}=e;return(0,a.kt)(c,(0,i.Z)({},d,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"tailwindcss-\u591a\u4e0a\u4e0b\u6587\u4e0e\u72ec\u7acb\u5206\u5305"},"tailwindcss \u591a\u4e0a\u4e0b\u6587\u4e0e\u72ec\u7acb\u5206\u5305"),(0,a.kt)("p",null,"\u4f60\u770b\u8fc7\u52a8\u6f2b\u300a\u767e\u517d\u738b\u300b\u5417\uff1f\u300a\u767e\u517d\u738b\u300b\u7684\u4e3b\u4eba\u516c\u662f\u4e94\u4e2a\u98de\u884c\u5458\uff0c\u4ed6\u4eec\u5206\u522b\u9a7e\u9a76\u9ed1\u3001\u7ea2\u3001\u9752\u3001\u9ec4\u3001\u7eff\u4e94\u5934\u673a\u5668\u72ee\uff0c\u5b83\u4eec\u5e73\u65f6\u53ef\u4ee5\u5355\u72ec\u8fdb\u884c\u4f5c\u6218\uff0c\u9047\u5230\u5f3a\u654c\u65f6\uff0c\u4e5f\u80fd\u8fdb\u884c\u4e94\u72ee\u5408\u4f53\uff0c\u6210\u4e3a\u5de8\u5927\u673a\u5668\u4eba\u201c\u767e\u517d\u738b\u201d\u3002"),(0,a.kt)("p",null,"\u540c\u6837\uff0c\u5728\u65e5\u5e38\u5f00\u53d1\u4e2d\uff0c\u6211\u4eec\u7ecf\u5e38\u9047\u5230\u8fd9\u6837\u7684\u95ee\u9898\uff0c\u4e00\u4e2a\u5f88\u5927\u7684\u7a0b\u5e8f\uff0c\u5b83\u6709\u5f88\u591a\u4e2a\u72ec\u7acb\u7684\u90e8\u5206\u7ec4\u6210\uff0c\u6bcf\u4e00\u4e2a\u90e8\u5206\u53ef\u4ee5\u5355\u72ec\u8fd0\u884c\uff0c\u4e5f\u6709\u72ec\u7acb\u7684\u5165\u53e3\uff0c\u76f8\u4e92\u4e4b\u95f4\u6ca1\u6709\u4efb\u4f55\u7684\u4f9d\u8d56\uff0c\u4f46\u662f\u5b83\u4eec\u5728\u540c\u4e00\u4e2a\u9879\u76ee/\u4efb\u52a1\u91cc\u8fdb\u884c\u6784\u5efa\u3002"),(0,a.kt)("p",null,"\u5728\u8fd9\u79cd\u573a\u666f\u4e0b\uff0c\u53bb\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u5c31\u5f80\u5f80\u9700\u8981\u53bb\u521b\u5efa\u591a\u4e2a\u4e0a\u4e0b\u6587\uff0c\u8ba9\u8fd9\u4e9b\u4e0a\u4e0b\u6587\u5404\u81ea\u53bb\u7ba1\u7406\u6211\u4eec\u7a0b\u5e8f\u4e2d\u7684\u6307\u5b9a\u7684\u4e00\u5757\u533a\u57df\u3002"),(0,a.kt)("p",null,"\u5f53\u7136\u6211\u5199\u5230\u8fd9\uff0c\u76f8\u4fe1\u5927\u5bb6\u4e5f\u5565\u90fd\u6ca1\u770b\u61c2\uff0c\u4e8e\u662f\u6211\u642c\u51fa\u4e00\u4e2a\u5c0f\u7a0b\u5e8f\u4e2d\uff0c\u72ec\u7acb\u5206\u5305\u7684\u793a\u4f8b\uff0c\u6765\u8ba9\u5927\u5bb6\u7406\u89e3\u8fd9\u79cd\u601d\u60f3\u3002"),(0,a.kt)("h2",{id:"\u4ec0\u4e48\u662f\u72ec\u7acb\u5206\u5305"},"\u4ec0\u4e48\u662f\u72ec\u7acb\u5206\u5305"),(0,a.kt)("p",null,"\u72ec\u7acb\u5206\u5305\u662f\u5c0f\u7a0b\u5e8f\u4e2d\u4e00\u79cd\u7279\u6b8a\u7c7b\u578b\u7684\u5206\u5305\uff0c\u53ef\u4ee5\u72ec\u7acb\u4e8e\u4e3b\u5305\u548c\u5176\u4ed6\u5206\u5305\u8fd0\u884c\u3002\u4ece\u72ec\u7acb\u5206\u5305\u4e2d\u9875\u9762\u8fdb\u5165\u5c0f\u7a0b\u5e8f\u65f6\uff0c\u4e0d\u9700\u8981\u4e0b\u8f7d\u4e3b\u5305\u3002\u5f53\u7528\u6237\u8fdb\u5165\u666e\u901a\u5206\u5305\u6216\u4e3b\u5305\u5185\u9875\u9762\u65f6\uff0c\u4e3b\u5305\u624d\u4f1a\u88ab\u4e0b\u8f7d\u3002"),(0,a.kt)("p",null,"\u72ec\u7acb\u5206\u5305\u5c5e\u4e8e\u5206\u5305\u7684\u4e00\u79cd\u3002\u666e\u901a\u5206\u5305\u7684\u6240\u6709\u9650\u5236\u90fd\u5bf9\u72ec\u7acb\u5206\u5305\u6709\u6548\u3002\u72ec\u7acb\u5206\u5305\u4e2d\u63d2\u4ef6\u3001\u81ea\u5b9a\u4e49\u7ec4\u4ef6\u7684\u5904\u7406\u65b9\u5f0f\u540c\u666e\u901a\u5206\u5305\u3002\u6b64\u5916\uff0c\u4f7f\u7528\u72ec\u7acb\u5206\u5305\u65f6\u8981\u6ce8\u610f\uff1a"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u72ec\u7acb\u5206\u5305\u4e2d\u4e0d\u80fd\u4f9d\u8d56\u4e3b\u5305\u548c\u5176\u4ed6\u5206\u5305\u4e2d\u7684\u5185\u5bb9\uff0c\u5305\u62ec js \u6587\u4ef6\u3001template\u3001wxss\u3001\u81ea\u5b9a\u4e49\u7ec4\u4ef6\u3001\u63d2\u4ef6\u7b49\uff08\u4f7f\u7528 \u5206\u5305\u5f02\u6b65\u5316 \u65f6 js \u6587\u4ef6\u3001\u81ea\u5b9a\u4e49\u7ec4\u4ef6\u3001\u63d2\u4ef6\u4e0d\u53d7\u6b64\u6761\u9650\u5236\uff09"),(0,a.kt)("li",{parentName:"ol"},"\u4e3b\u5305\u4e2d\u7684 ",(0,a.kt)("inlineCode",{parentName:"li"},"app.wxss")," \u5bf9\u72ec\u7acb\u5206\u5305\u65e0\u6548\uff0c\u5e94\u907f\u514d\u5728\u72ec\u7acb\u5206\u5305\u9875\u9762\u4e2d\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"li"},"app.wxss")," \u4e2d\u7684\u6837\u5f0f\uff1b"),(0,a.kt)("li",{parentName:"ol"},"App \u53ea\u80fd\u5728\u4e3b\u5305\u5185\u5b9a\u4e49\uff0c\u72ec\u7acb\u5206\u5305\u4e2d\u4e0d\u80fd\u5b9a\u4e49 App\uff0c\u4f1a\u9020\u6210\u65e0\u6cd5\u9884\u671f\u7684\u884c\u4e3a\uff1b"),(0,a.kt)("li",{parentName:"ol"},"\u72ec\u7acb\u5206\u5305\u4e2d\u6682\u65f6\u4e0d\u652f\u6301\u4f7f\u7528\u63d2\u4ef6\u3002")),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"\u66f4\u591a\u4fe1\u606f\u8be6\u89c1 ",(0,a.kt)("a",{parentName:"p",href:"https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/independent.html"},"\u5fae\u4fe1\u72ec\u7acb\u5206\u5305\u5b98\u65b9\u6587\u6863"))),(0,a.kt)("hr",null),(0,a.kt)("p",null,"\u8fd9\u91cc\u8981\u7279\u522b\u6ce8\u610f\u7b2c\u4e8c\u6761: ",(0,a.kt)("strong",{parentName:"p"},"\u4e3b\u5305\u4e2d\u7684 ",(0,a.kt)("inlineCode",{parentName:"strong"},"app.wxss")," \u5bf9\u72ec\u7acb\u5206\u5305\u662f\u65e0\u6548\u7684!!!")),(0,a.kt)("p",null,"\u5728\u6211\u4e4b\u524d\u63d0\u4f9b\u7684",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss"),"\u5c0f\u7a0b\u5e8f\u6a21\u677f\u7684\u793a\u4f8b\u4e2d\uff0c\u6240\u6709 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u751f\u6210\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"wxss")," \u5de5\u5177\u7c7b\u90fd\u662f\u5728\u4e3b\u5305\u91cc\u5171\u7528\u7684 (",(0,a.kt)("inlineCode",{parentName:"p"},"app.wxss"),")\uff0c\u8fd9\u5728\u5927\u90e8\u5206\u60c5\u51b5\u4e0b\u8fd0\u8f6c\u826f\u597d\uff0c\u7136\u800c\u8fd9\u5728\u72ec\u7acb\u5206\u5305\u573a\u666f\u4e0b\uff0c\u662f\u4e0d\u884c\u7684\uff01\u56e0\u4e3a\u4e3b\u5305\u7684\u6837\u5f0f\u65e0\u6cd5\u5f71\u54cd\u5230\u72ec\u7acb\u5206\u5305\u3002"),(0,a.kt)("p",null,"\u90a3\u4e48\u5e94\u8be5\u600e\u4e48\u505a\u624d\u80fd\u89e3\u51b3\u8fd9\u4e2a\u95ee\u9898\u5462\uff1f"),(0,a.kt)("h2",{id:"\u521b\u5efa\u4e0e\u914d\u7f6e\u793a\u4f8b"},"\u521b\u5efa\u4e0e\u914d\u7f6e\u793a\u4f8b"),(0,a.kt)("p",null,"\u8fd9\u91cc\u7b14\u8005\u5148\u4ee5 ",(0,a.kt)("inlineCode",{parentName:"p"},"taro@3.6.7")," \u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"weapp-tailwindcss@2.5.2")," \u7248\u672c\u7684\u9879\u76ee\u4f5c\u4e3a\u793a\u4f8b\u3002"),(0,a.kt)("p",null,"\u9996\u5148\u914d\u7f6e\u597d ",(0,a.kt)("inlineCode",{parentName:"p"},"weapp-tailwindcss")," \u7684\u914d\u7f6e\uff0c\u7136\u540e\u5728 ",(0,a.kt)("inlineCode",{parentName:"p"},"config/index.js")," \u4e2d\u5173\u95ed ",(0,a.kt)("inlineCode",{parentName:"p"},"prebundle")," \u529f\u80fd\uff0c\u56e0\u4e3a\u8fd9\u5728\u72ec\u7acb\u5206\u5305\u573a\u666f\u4e0b\u4f1a\u62a5\u4e00\u4e9b\u672a\u77e5\u7684\u9519\u8bef:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const config = {\n  compiler: {\n    prebundle: {\n      enable: false,\n    },\n    type: 'webpack5'\n  },\n  // .....\n}\n")),(0,a.kt)("p",null,"\u5176\u6b21\u5173\u95ed\u63d2\u4ef6\u5bf9 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss css var")," \u4e3b\u5757\u7684\u5bfb\u5740\u884c\u4e3a\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"chain.merge({\n  plugin: {\n    install: {\n      plugin: UnifiedWebpackPluginV5,\n      args: [{\n        // \u65b9\u6cd51: \u4e0d\u8981\u4f20 appType\n        // \u6ce8\u91ca\u6389 appType : 'taro'\n        // \u6216\u8005\u65b9\u6cd52: \u8ba9\u6240\u6709css chunk \u90fd\u662f main chunk\n        // mainCssChunkMatcher: ()=> true\n        // 2 \u79cd\u9009\u5176\u4e00\u5373\u53ef\n      }]\n    }\n  }\n})\n")),(0,a.kt)("p",null,"\u63a5\u4e0b\u6765\u6211\u4eec\u5c31\u53ef\u4ee5\u521b\u5efa\u4e00\u4e2a\u72ec\u7acb\u5206\u5305 ",(0,a.kt)("inlineCode",{parentName:"p"},"moduleA"),"\uff0c\u5728\u91cc\u9762\u65b0\u5efa\u4e00\u4e2a ",(0,a.kt)("inlineCode",{parentName:"p"},'"pages/index"')," \u9875\u9762\uff0c\u5e76\u5199\u5165\u4e00\u4e2a\u53ea\u5c5e\u4e8e ",(0,a.kt)("inlineCode",{parentName:"p"},"moduleA")," \u7684\u72ec\u4e00\u65e0\u4e8c\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss class"),"\uff0c\u7136\u540e\u5728 ",(0,a.kt)("inlineCode",{parentName:"p"},"app.config.ts")," \u91cc\u6ce8\u518c\u5b83:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},'  subpackages: [\n    {\n      root: "moduleA",\n      pages: [\n        "pages/index",\n      ],\n      // \u4e0b\u65b9\u8fd9\u4e2a\u6807\u5fd7\u4f4d\uff0c\u58f0\u660e\u72ec\u7acb\u5206\u5305\n      independent: true\n    },\n  ]\n')),(0,a.kt)("p",null,"\u5230\u8fd9\u91cc\uff0c\u51c6\u5907\u5de5\u4f5c\u5c31\u5b8c\u6210\u4e86\uff0c\u63a5\u4e0b\u6765\u5c31\u53ef\u4ee5\u8bbe\u8ba1\u65b9\u6848\u4e86\u3002"),(0,a.kt)("h2",{id:"\u5355-tailwindcss-\u4e0a\u4e0b\u6587\u7684\u65b9\u6848\u4e0d\u5b8c\u7f8e\u4e0d\u63a8\u8350"},"\u5355 ",(0,a.kt)("inlineCode",{parentName:"h2"},"tailwindcss")," \u4e0a\u4e0b\u6587\u7684\u65b9\u6848\uff08\u4e0d\u5b8c\u7f8e\u4e0d\u63a8\u8350\uff09"),(0,a.kt)("p",null,"\u8fd9\u4e2a\u65b9\u6848\u662f\u4e00\u4e2a\u4e0d\u5b8c\u7f8e\u7684\u65b9\u6848\uff0c\u5728\u8fd9\u91cc\u5199\u51fa\u6765\u662f\u4e3a\u4e86\u4fc3\u8fdb\u5927\u5bb6\u5bf9 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u7684\u7406\u89e3\u3002"),(0,a.kt)("p",null,"\u9996\u5148\u5728\u72ec\u7acb\u5206\u5305\u4e2d\uff0c\u4e5f\u521b\u5efa\u4e00\u4e2a ",(0,a.kt)("inlineCode",{parentName:"p"},"index.scss")," \u5185\u5bb9\u4e3a:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-css"},"@import 'tailwindcss/base';\n@import 'tailwindcss/components';\n@import 'tailwindcss/utilities';\n")),(0,a.kt)("p",null,"\u7136\u540e\u5728\u6240\u6709\u72ec\u7acb\u5206\u5305\u4e2d\u7684\u9875\u9762\u5f15\u7528\u5b83\uff0c\u8fd9\u6837\u6253\u5305\u4e4b\u540e\uff0c\u72ec\u7acb\u5206\u5305\u91cc\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u6837\u5f0f\u4e5f\u5c31\u751f\u6548\u4e86\u3002"),(0,a.kt)("p",null,"\u7136\u800c\u8fd9\u79cd\u65b9\u5f0f\u6709\u4e00\u4e2a\u5de8\u5927\u7684\u95ee\u9898\uff0c\u5c31\u662f\u5b83\u4f1a\u5e26\u6765\u4e25\u91cd\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"css")," \u5197\u4f59\u3002"),(0,a.kt)("p",null,"\u56e0\u4e3a\u6b64\u65f6 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u4e0a\u4e0b\u6587\u6709\u4e14\u4ec5\u6709\u4e00\u4e2a\uff0c\u5b83\u4f1a\u628a\u5728\u8fd9\u4e2a\u9879\u76ee\u4e2d\uff0c\u6240\u6709\u63d0\u53d6\u51fa\u6765\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"css")," \u5de5\u5177\u7c7b\uff0c\u5168\u90e8\u6ce8\u5165\u5230\u6240\u6709\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"@tailwind")," \u6307\u4ee4\u91cc\u53bb\u3002",(0,a.kt)("inlineCode",{parentName:"p"},"@import 'tailwindcss/utilities'")," \u8fd9\u4e2a\u5f15\u5165(\u672c\u8d28\u5b9e\u9645\u4e0a\u662f",(0,a.kt)("inlineCode",{parentName:"p"},"@tailwind"),"\u6307\u4ee4)\u4e00\u4e0b\u5b50\u81a8\u80c0\u4e86\u8d77\u6765\u3002"),(0,a.kt)("p",null,"\u8fd9\u5bfc\u81f4\u4e86\uff0c\u4e3b\u5305\u91cc\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"app.wxss")," \u91cc\uff0c\u4f1a\u5305\u542b\u4e3b\u5305\u91cc\u6240\u6709\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"class")," + \u72ec\u7acb\u5206\u5305\u91cc\u6240\u6709\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"class"),"\uff0c\u800c\u72ec\u7acb\u5206\u5305\u91cc\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"index.scss")," \u91cc\uff0c\u4e5f\u5305\u542b\u4e3b\u5305\u91cc\u6240\u6709\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"class")," + \u72ec\u7acb\u5206\u5305\u91cc\u6240\u6709\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"class"),"!"),(0,a.kt)("p",null,"\u8fd9\u663e\u7136\u662f\u4e0d\u53ef\u63a5\u53d7\u7684\uff0c\u56e0\u4e3a\u4e3b\u5305\u662f\u6ca1\u6709\u5fc5\u8981\u5305\u542b\u72ec\u7acb\u5206\u5305\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"class"),"\uff0c\u800c\u72ec\u7acb\u5206\u5305\u91cc\uff0c\u4e5f\u6ca1\u6709\u5fc5\u8981\u5305\u542b\u4e3b\u5305\u91cc\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"class"),"! \u8fd9\u53ea\u4f1a\u767d\u767d\u589e\u5927\u6253\u5305\u540e",(0,a.kt)("inlineCode",{parentName:"p"},"wxss"),"\u6587\u4ef6\u7684\u4f53\u79ef\u3002"),(0,a.kt)("p",null,"\u6240\u4ee5\u8fd9\u4e2a\u65b9\u6848\u9700\u8981\u6539\u8fdb!"),(0,a.kt)("h2",{id:"\u591a-tailwindcss-\u4e0a\u4e0b\u6587\u7684\u65b9\u6848"},"\u591a ",(0,a.kt)("inlineCode",{parentName:"h2"},"tailwindcss")," \u4e0a\u4e0b\u6587\u7684\u65b9\u6848"),(0,a.kt)("p",null,"\u7531\u4e8e\u4e0a\u9762\u90a3\u4e2a\u65b9\u6848\u7684\u95ee\u9898\uff0c\u6211\u4eec\u5f00\u59cb\u6539\u8fdb\uff0c\u5c31\u5fc5\u987b\u8981\u521b\u5efa\u591a\u4e2a ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u4e0a\u4e0b\u6587\u3002"),(0,a.kt)("p",null,"\u90a3\u4e48\u7b2c\u4e00\u6b65\u5c31\u662f\u8981 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"\u2193"))),(0,a.kt)("h3",{id:"\u521b\u5efa\u591a\u4e2a-tailwindconfigjs"},"\u521b\u5efa\u591a\u4e2a ",(0,a.kt)("inlineCode",{parentName:"h3"},"tailwind.config.js")),(0,a.kt)("p",null,"\u6bd4\u5982\u8bf4\u6211\u4eec\u53ea\u6709\u4e00\u4e2a\u72ec\u7acb\u5206\u5305\uff0c\u6240\u4ee5\u6211\u4eec\u521b\u5efa\u4e862\u4e2a ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwind.config.js"),":"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("inlineCode",{parentName:"li"},"tailwind.config.js")," \u7528\u4e8e\u4e3b\u5305\u4ee5\u53ca\u76f8\u4e92\u4f9d\u8d56\u7684\u5b50\u5305"),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("inlineCode",{parentName:"li"},"tailwind.config.sub.js")," \u7528\u4e8e ",(0,a.kt)("inlineCode",{parentName:"li"},"moduleA")," \u8fd9\u4e2a\u72ec\u7acb\u5206\u5305")),(0,a.kt)("p",null,"\u5185\u5bb9\u5982\u4e0b:"),(0,a.kt)("h4",{id:"\u72ec\u7acb\u5206\u5305\u7684\u4e0a\u4e0b\u6587\u914d\u7f6e"},"\u72ec\u7acb\u5206\u5305\u7684\u4e0a\u4e0b\u6587\u914d\u7f6e"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"// `moduleA` \u8fd9\u4e2a\u72ec\u7acb\u5206\u5305\u7684 tailwind.config.sub.js\n/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  // \u8fd9\u91cc\u53ea\u63d0\u53d6 moduleA \u8fd9\u4e2a\u72ec\u7acb\u5206\u5305\u4e0b\u7684\u6587\u4ef6\u5185\u5bb9\n  content: [\"./src/moduleA/**/*.{html,js,ts,jsx,tsx}\"],\n  // ....\n  corePlugins: {\n    preflight: false\n  }\n}\n")),(0,a.kt)("h4",{id:"\u4e3b\u5305\u4ee5\u53ca\u76f8\u4e92\u4f9d\u8d56\u7684\u5b50\u5305\u7684\u4e0a\u4e0b\u6587\u914d\u7f6e"},"\u4e3b\u5305\u4ee5\u53ca\u76f8\u4e92\u4f9d\u8d56\u7684\u5b50\u5305\u7684\u4e0a\u4e0b\u6587\u914d\u7f6e"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},'// \u4e3b\u5305\u4ee5\u53ca\u76f8\u4e92\u4f9d\u8d56\u7684\u5b50\u5305\u7684 tailwind.config.js\n/** @type {import(\'tailwindcss\').Config} */\nmodule.exports = {\n  // https://github.com/mrmlnc/fast-glob\n  // \u8fd9\u91cc\u9700\u8981\u9650\u5b9a\u8303\u56f4\uff0c\u4e0d\u53bb\u63d0\u53d6 moduleA \u8fd9\u4e2a\u72ec\u7acb\u5206\u5305\u4e0b\u7684\u6587\u4ef6\u5185\u5bb9\n  // \u6240\u4ee5\u540e\u9762\u8ddf\u4e86\u4e00\u4e2a `!` \u5f00\u5934\u7684\u8def\u5f84\n  content: [\n    "./src/**/*.{html,js,ts,jsx,tsx}", \n    // \u4e0d\u63d0\u53d6\u72ec\u7acb\u5206\u5305\u91cc\u7684 class\n    "!./src/moduleA/**/*.{html,js,ts,jsx,tsx}"],\n  // ....\n  corePlugins: {\n    preflight: false\n  }\n}\n')),(0,a.kt)("p",null,"\u8fd9\u6837 ",(0,a.kt)("inlineCode",{parentName:"p"},"2")," \u4e2a\u914d\u7f6e\u6587\u4ef6\u521b\u5efa\u597d\u4e86\uff0c\u63a5\u4e0b\u6765\u5c31\u8981\u901a\u8fc7\u914d\u7f6e\u8ba9\u5b83\u4eec\u5404\u81ea\u5728\u6253\u5305\u4e2d\u751f\u6548\u3002"),(0,a.kt)("h3",{id:"postcssconfigjs-\u914d\u7f6e"},(0,a.kt)("inlineCode",{parentName:"h3"},"postcss.config.js")," \u914d\u7f6e"),(0,a.kt)("p",null,"\u8fd9\u662f\u975e\u5e38\u91cd\u8981\u7684\u4e00\u5757\u914d\u7f6e\uff0c\u6211\u4eec\u9700\u8981\u628a ",(0,a.kt)("inlineCode",{parentName:"p"},"postcss.config.js")," \u7684\u914d\u7f6e\u53d8\u6210\u4e00\u4e2a\u51fd\u6570\uff0c\u8fd9\u6837\u624d\u80fd\u628a\u6784\u5efa\u65f6\u7684\u4e0a\u4e0b\u6587\u4f20\u5165\u8fdb\u6765\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const path = require('path')\n\nmodule.exports = function config(loaderContext) {\n  // moduleA \u4e0b\u9762\u7684\u6240\u6709 scss \u6587\u4ef6\uff0c\u90fd\u662f\u72ec\u7acb\u6a21\u5757\u7684\uff0c\u5e94\u7528\u4e0d\u540c\u7684 tailwindcss \u914d\u7f6e\n  const isModuleA = /moduleA[/\\\\](?:\\w+[/\\\\])*\\w+\\.scss$/.test(\n    loaderContext.file\n  )\n  // \u591a\u4e2a\u72ec\u7acb\u5b50\u5305\u540c\u7406\uff0c\u52a0\u6761\u4ef6\u5206\u652f\u5373\u53ef\n  if (isModuleA) {\n    return {\n      plugins: {\n        tailwindcss: {\n          config: path.resolve(__dirname, 'tailwind.config.sub.js')\n        },\n        autoprefixer: {},\n      }\n    }\n  }\n  \n  return {\n    plugins: {\n      // \u4e0d\u4f20\u9ed8\u8ba4\u53d6 tailwind.config.js\n      tailwindcss: {},\n      autoprefixer: {},\n    }\n  }\n}\n")),(0,a.kt)("p",null,"\u901a\u8fc7\u8fd9\u79cd\u65b9\u5f0f\uff0c\u6211\u4eec\u6210\u529f\u7684\u521b\u5efa\u4e86 ",(0,a.kt)("inlineCode",{parentName:"p"},"2")," \u4e2a\u4e0d\u540c\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u4e0a\u4e0b\u6587\uff0c\u6b64\u65f6\u4f60\u8fdb\u884c\u6253\u5305\u4e4b\u540e\uff0c\u4f1a\u53d1\u73b0"),(0,a.kt)("p",null,"\u4e3b\u5305\u91cc\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"app.wxss")," \u548c\u72ec\u7acb\u5206\u5305\u91cc\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"index.wxss"),"\uff0c\u91cc\u9762\u7684\u5185\u5bb9\u5c31\u5df2\u7ecf\u5404\u5f52\u5404\u4e86\uff0c\u4e0d\u518d\u76f8\u4e92\u5305\u542b\u4e86\u3002"),(0,a.kt)("h2",{id:"\u5c3e\u8a00"},"\u5c3e\u8a00"),(0,a.kt)("p",null,"\u5f53\u7136\uff0c\u4e0a\u9762\u53ea\u662f\u4e00\u79cd\u65b9\u6848\uff0c\u8fbe\u5230\u8fd9\u6837\u7684\u76ee\u7684\u65b9\u5f0f\u6709\u5f88\u591a\u79cd\uff0c\u6bd4\u5982\u4f60\u53ef\u4ee5\u5728\u8fd0\u884c\u65f6\u53bb\u4fee\u6539 ",(0,a.kt)("inlineCode",{parentName:"p"},"postcss-loader")," \u5bf9\u5b83\u8fdb\u884c\u52ab\u6301\uff0c\u6216\u8005\u62c6\u6210\u591a\u4e2a\u9879\u76ee\uff0c\u5206\u5f00\u6784\u5efa\u3002"),(0,a.kt)("p",null,"\u6211\u8fd9\u7bc7\u6587\u7ae0\u53ea\u662f\u629b\u7816\u5f15\u7389\uff0c\u76f8\u4fe1\u806a\u660e\u7684\u4f60\u4eec\u4e00\u5b9a\u53ef\u4ee5\u4e3e\u4e00\u53cd\u4e09\u7684\u3002"),(0,a.kt)("h2",{id:"\u53c2\u8003\u793a\u4f8b"},"\u53c2\u8003\u793a\u4f8b"),(0,a.kt)("p",null,"\u793a\u4f8b\u89c1:",(0,a.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo/taro-app"},"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo/taro-app")))}u.isMDXComponent=!0}}]);