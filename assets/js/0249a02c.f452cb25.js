"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[957],{9613:(e,n,t)=>{t.d(n,{Zo:()=>l,kt:()=>f});var r=t(9496);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function p(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var c=r.createContext({}),u=function(e){var n=r.useContext(c),t=n;return e&&(t="function"==typeof e?e(n):p(p({},n),e)),t},l=function(e){var n=u(e.components);return r.createElement(c.Provider,{value:n},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,l=o(e,["components","mdxType","originalType","parentName"]),s=u(t),d=a,f=s["".concat(c,".").concat(d)]||s[d]||m[d]||i;return t?r.createElement(f,p(p({ref:n},l),{},{components:t})):r.createElement(f,p({ref:n},l))}));function f(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var i=t.length,p=new Array(i);p[0]=d;var o={};for(var c in n)hasOwnProperty.call(n,c)&&(o[c]=n[c]);o.originalType=e,o[s]="string"==typeof e?e:a,p[1]=o;for(var u=2;u<i;u++)p[u]=t[u];return r.createElement.apply(null,p)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"},287:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>p,default:()=>m,frontMatter:()=>i,metadata:()=>o,toc:()=>u});var r=t(1163),a=(t(9496),t(9613));const i={},p="uni-app (vue2/3)",o={unversionedId:"quick-start/frameworks/uni-app",id:"quick-start/frameworks/uni-app",title:"uni-app (vue2/3)",description:"\u5728\u521b\u5efauni-app\u9879\u76ee\u65f6\uff0c\u8bf7\u9009\u62e9uni-app alpha\u7248\u672c",source:"@site/docs/quick-start/frameworks/uni-app.md",sourceDirName:"quick-start/frameworks",slug:"/quick-start/frameworks/uni-app",permalink:"/weapp-tailwindcss-webpack-plugin/docs/quick-start/frameworks/uni-app",draft:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/dev/website/docs/quick-start/frameworks/uni-app.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"\u5b89\u88c5\u8fd9\u4e2a\u63d2\u4ef6",permalink:"/weapp-tailwindcss-webpack-plugin/docs/quick-start/this-plugin"},next:{title:"uni-app vite(vue3)",permalink:"/weapp-tailwindcss-webpack-plugin/docs/quick-start/frameworks/uni-app-vite"}},c={},u=[],l={toc:u},s="wrapper";function m(e){let{components:n,...t}=e;return(0,a.kt)(s,(0,r.Z)({},l,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"uni-app-vue23"},"uni-app (vue2/3)"),(0,a.kt)("admonition",{type:"tip"},(0,a.kt)("p",{parentName:"admonition"},(0,a.kt)("strong",{parentName:"p"},"\u5728\u521b\u5efauni-app\u9879\u76ee\u65f6\uff0c\u8bf7\u9009\u62e9uni-app alpha\u7248\u672c"),"  "),(0,a.kt)("p",{parentName:"admonition"},"\u8fd9\u662f\u56e0\u4e3a\uff0c\u76ee\u524d\u9ed8\u8ba4\u521b\u5efa\u7684\u7248\u672c\u8fd8\u662f ",(0,a.kt)("inlineCode",{parentName:"p"},"@vue/cli 4.x")," \u7684\u7248\u672c\uff0c\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"webpack 4.x")," \u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"postcss 7.x"),"\uff0c\u800c ",(0,a.kt)("inlineCode",{parentName:"p"},"alpha")," \u7248\u672c\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"@vue/cli 5.x")," \uff0c\u5185\u90e8\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"webpack 5.x")," \u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"postcss 8.x"),"\uff0c\u8fd9\u624d\u53ef\u4ee5\u4f7f\u7528\u6700\u65b0\u7248\u672c\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u548c\u672c\u63d2\u4ef6\u7684\u6700\u65b0\u63d2\u4ef6\u7248\u672c\u3002"),(0,a.kt)("p",{parentName:"admonition"},"\u5982\u679c\u4f60\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"@vue/cli 4.x")," \u7248\u672c\uff0c\u4f60\u53ef\u4ee5\u4f7f\u7528\u975e ",(0,a.kt)("inlineCode",{parentName:"p"},"Unified")," \u5f00\u5934\u7684",(0,a.kt)("inlineCode",{parentName:"p"},"v1"),"\u7248\u672c\u7684\u63d2\u4ef6\uff0c\u4e0d\u8fc7\u5b83\u4eec\u7684\u5f00\u53d1\u4f53\u9a8c\u8981\u6bd4 ",(0,a.kt)("inlineCode",{parentName:"p"},"Unified")," \u5f00\u5934\u7684\u63d2\u4ef6\u5dee\u4e00\u4e9b\u3002"),(0,a.kt)("p",{parentName:"admonition"},"\u901a\u8fc7 ",(0,a.kt)("inlineCode",{parentName:"p"},"@vue/cli")," \u521b\u5efa\u7684\u65b9\u5f0f\u4e3a\uff1a"),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"vue create -p dcloudio/uni-preset-vue#alpha my-alpha-project\n"))),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"// \u5728 vue.config.js \u91cc\u6ce8\u518c\nconst { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')\n/**\n * @type {import('@vue/cli-service').ProjectOptions}\n */\nconst config = {\n  // some option...\n  configureWebpack: (config) => {\n    config.plugins.push(\n      new UnifiedWebpackPluginV5({\n        appType: 'uni-app'\n      })\n    )\n  }\n  // other option...\n}\n\nmodule.exports = config\n")),(0,a.kt)("p",null,"\u8fd9\u6837\u6240\u6709\u7684\u914d\u7f6e\u4fbf\u5b8c\u6210\u4e86\uff01\u8d76\u7d27\u542f\u52a8\u4f60\u7684\u9879\u76ee\u8bd5\u8bd5\u5427\uff01"))}m.isMDXComponent=!0}}]);