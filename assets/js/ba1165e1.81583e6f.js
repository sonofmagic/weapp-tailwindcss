"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[4936],{9613:(e,n,t)=>{t.d(n,{Zo:()=>c,kt:()=>k});var r=t(9496);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function p(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var o=r.createContext({}),s=function(e){var n=r.useContext(o),t=n;return e&&(t="function"==typeof e?e(n):p(p({},n),e)),t},c=function(e){var n=s(e.components);return r.createElement(o.Provider,{value:n},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},u=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),d=s(t),u=a,k=d["".concat(o,".").concat(u)]||d[u]||m[u]||i;return t?r.createElement(k,p(p({ref:n},c),{},{components:t})):r.createElement(k,p({ref:n},c))}));function k(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var i=t.length,p=new Array(i);p[0]=u;var l={};for(var o in n)hasOwnProperty.call(n,o)&&(l[o]=n[o]);l.originalType=e,l[d]="string"==typeof e?e:a,p[1]=l;for(var s=2;s<i;s++)p[s]=t[s];return r.createElement.apply(null,p)}return r.createElement.apply(null,t)}u.displayName="MDXCreateElement"},6248:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>p,default:()=>m,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var r=t(2564),a=(t(9496),t(9613));const i={},p="2.x \u7248\u672c\u65b0\u7279\u6027",l={unversionedId:"releases/v2",id:"releases/v2",title:"2.x \u7248\u672c\u65b0\u7279\u6027",description:"\u8fd9\u4e2a\u7248\u672c\u65b0\u589e\u4e86 UnifiedWebpackPluginV5",source:"@site/docs/releases/v2.md",sourceDirName:"releases",slug:"/releases/v2",permalink:"/weapp-tailwindcss/docs/releases/v2",draft:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/dev/website/docs/releases/v2.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"tailwindcss in weapp \u7684\u539f\u7406",permalink:"/weapp-tailwindcss/docs/principle/"}},o={},s=[{value:"\u65b0\u63d2\u4ef6\u4ecb\u7ecd",id:"\u65b0\u63d2\u4ef6\u4ecb\u7ecd",level:2}],c={toc:s},d="wrapper";function m(e){let{components:n,...t}=e;return(0,a.kt)(d,(0,r.Z)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"2x-\u7248\u672c\u65b0\u7279\u6027"},"2.x \u7248\u672c\u65b0\u7279\u6027"),(0,a.kt)("p",null,"\u8fd9\u4e2a\u7248\u672c\u65b0\u589e\u4e86 ",(0,a.kt)("inlineCode",{parentName:"p"},"UnifiedWebpackPluginV5"),"\n\u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"UnifiedViteWeappTailwindcssPlugin")," \u8fd9\u79cd ",(0,a.kt)("inlineCode",{parentName:"p"},"Unified")," \u5f00\u5934\u7684\u63d2\u4ef6\u3002"),(0,a.kt)("p",null,"\u5b83\u4eec\u80fd\u591f\u81ea\u52a8\u8bc6\u522b\u5e76\u7cbe\u786e\u5904\u7406\u6240\u6709 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u7684\u5de5\u5177\u7c7b\u3002\u8fd9\u610f\u5473\u7740\u5b83\u53ef\u4ee5\u540c\u65f6\u5904\u7406\u6240\u6709\u6587\u4ef6\u4e2d\u7684\u9759\u6001\u6216\u52a8\u6001\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"class"),"\u3002"),(0,a.kt)("p",null,"\u76f8\u6bd4",(0,a.kt)("inlineCode",{parentName:"p"},"v1"),"\u7248\u672c\u53ea\u6709\u5904\u7406",(0,a.kt)("inlineCode",{parentName:"p"},"wxss"),",",(0,a.kt)("inlineCode",{parentName:"p"},"wxml"),"\u9759\u6001",(0,a.kt)("inlineCode",{parentName:"p"},"class"),"\u7684\u80fd\u529b\uff0c\u4f7f\u7528",(0,a.kt)("inlineCode",{parentName:"p"},"v2"),"\u7248\u672c\u65b0\u7684\u63d2\u4ef6\uff0c\u4f60\u518d\u4e5f\u4e0d\u9700\u8981\u5728 ",(0,a.kt)("inlineCode",{parentName:"p"},"js")," \u91cc\u5f15\u5165\u5e76\u8c03\u7528\u6807\u8bb0\u65b9\u6cd5 ",(0,a.kt)("inlineCode",{parentName:"p"},"replaceJs"),"\u4e86\uff01",(0,a.kt)("inlineCode",{parentName:"p"},"2.x")," \u63d2\u4ef6\u6709\u7cbe\u51c6\u8f6c\u5316 ",(0,a.kt)("inlineCode",{parentName:"p"},"js"),"/",(0,a.kt)("inlineCode",{parentName:"p"},"jsx")," \u7684\u80fd\u529b\uff0c\u5927\u5927\u63d0\u5347\u4e86 ",(0,a.kt)("inlineCode",{parentName:"p"},"taro")," \u8fd9\u79cd\u52a8\u6001\u6a21\u677f\u6846\u67b6\u7684\u5f00\u53d1\u4f53\u9a8c\u3002"),(0,a.kt)("h2",{id:"\u65b0\u63d2\u4ef6\u4ecb\u7ecd"},"\u65b0\u63d2\u4ef6\u4ecb\u7ecd"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"UnifiedWebpackPluginV5")," \u662f\u4e00\u4e2a\u6838\u5fc3\u63d2\u4ef6\uff0c\u6240\u6709\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"webpack")," \u8fdb\u884c\u6253\u5305\u7684\u6846\u67b6\u90fd\u53ef\u4ee5\u4f7f\u7528\u5b83\uff0c\u53ea\u9700\u8981\u4f20\u5165 ",(0,a.kt)("inlineCode",{parentName:"p"},"appType")," \u914d\u7f6e\u9879: ",(0,a.kt)("inlineCode",{parentName:"p"},"uni-app"),"/",(0,a.kt)("inlineCode",{parentName:"p"},"taro"),"/",(0,a.kt)("inlineCode",{parentName:"p"},"rax"),"/",(0,a.kt)("inlineCode",{parentName:"p"},"remax"),"/",(0,a.kt)("inlineCode",{parentName:"p"},"mpx")," \u7b49\u7b49\uff0c\u5982\u679c\u4e0d\u4f20\u7684\u8bdd\uff0c\u63d2\u4ef6\u4f1a\u53bb\u731c\u6d4b\u516c\u5171\u7684\u6837\u5f0f\u6587\u4ef6\u4f4d\u7f6e\uff0c\u5e76\u8fdb\u884c\u8f6c\u5316(\u6709\u53ef\u80fd\u4e0d\u51c6\u786e)\u3002"),(0,a.kt)("p",null,"\u76ee\u524d\uff0c\u8fd9\u4e2a\u65b9\u6848\u53ea\u652f\u6301 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss v3.2.2")," \u4ee5\u4e0a\u7248\u672c\u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"webpack5"),"\u3002\u540c\u65f6\u8fd9\u4e2a\u65b9\u6848\u4f9d\u8d56 ",(0,a.kt)("inlineCode",{parentName:"p"},"monkey patch"),"\uff0c\u6240\u4ee5\u4f60\u5e94\u8be5\u628a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},' "scripts": {\n+  "postinstall": "weapp-tw patch"\n }\n')),(0,a.kt)("p",null,"\u52a0\u5165\u4f60\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"package.json"),"\u3002\u5f53\u7136\u5728\u5b89\u88c5\u6216\u8005\u66f4\u65b0 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u540e\uff0c\u624b\u52a8\u6267\u884c  ",(0,a.kt)("inlineCode",{parentName:"p"},"npx weapp-tw patch")," \u6548\u679c\u4e5f\u662f\u4e00\u6837\u7684\uff0c\u770b\u5230 ",(0,a.kt)("inlineCode",{parentName:"p"},"patch .... successfully")," \u8868\u793a\u6210\u529f\u3002"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"UnifiedViteWeappTailwindcssPlugin")," \u4e3a ",(0,a.kt)("inlineCode",{parentName:"p"},"vite")," \u4e13\u7528\u63d2\u4ef6\uff0c\u914d\u7f6e\u9879\u548c\u4f7f\u7528\u65b9\u5f0f\u4e5f\u662f\u548c\u4e0a\u9762\u4e00\u81f4\u7684\u3002"))}m.isMDXComponent=!0}}]);