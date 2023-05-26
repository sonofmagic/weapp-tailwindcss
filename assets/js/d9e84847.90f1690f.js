"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[8848],{9613:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>f});var r=n(9496);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):p(p({},t),e)),n},s=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,l=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),u=c(n),d=i,f=u["".concat(l,".").concat(d)]||u[d]||m[d]||a;return n?r.createElement(f,p(p({ref:t},s),{},{components:n})):r.createElement(f,p({ref:t},s))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,p=new Array(a);p[0]=d;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[u]="string"==typeof e?e:i,p[1]=o;for(var c=2;c<a;c++)p[c]=n[c];return r.createElement.apply(null,p)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},3220:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>p,default:()=>m,frontMatter:()=>a,metadata:()=>o,toc:()=>c});var r=n(2564),i=(n(9496),n(9613));const a={},p="\u4ece v1 \u8fc1\u79fb\u5230 v2",o={unversionedId:"migrations/v1",id:"migrations/v1",title:"\u4ece v1 \u8fc1\u79fb\u5230 v2",description:"\u5728 2.x \u7248\u672c\u4e2d\uff0c\u53ef\u4ee5\u628a\u4e4b\u524d\u4f7f\u7528\u7684 webpack \u63d2\u4ef6\uff0c\u5168\u90e8\u66f4\u6362\u4e3a UnifiedWebpackPluginV5 \u63d2\u4ef6\uff0c\u4e0d\u8fc7 vite \u63d2\u4ef6\u7684\u5bfc\u51fa\u6709\u4e00\u4e9b\u5c0f\u53d8\u5316:",source:"@site/docs/migrations/v1.md",sourceDirName:"migrations",slug:"/migrations/v1",permalink:"/docs/migrations/v1",draft:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/dev/website/docs/migrations/v1.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"\u7c7b\u540d\u7684\u538b\u7f29\u4e0e\u6df7\u6dc6",permalink:"/docs/mangle/"},next:{title:"\u65e7\u6709uni-app\u9879\u76ee\u5347\u7ea7webpack5\u6307\u5357",permalink:"/docs/upgrade/uni-app"}},l={},c=[],s={toc:c},u="wrapper";function m(e){let{components:t,...n}=e;return(0,i.kt)(u,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"\u4ece-v1-\u8fc1\u79fb\u5230-v2"},"\u4ece v1 \u8fc1\u79fb\u5230 v2"),(0,i.kt)("p",null,"\u5728 ",(0,i.kt)("inlineCode",{parentName:"p"},"2.x")," \u7248\u672c\u4e2d\uff0c\u53ef\u4ee5\u628a\u4e4b\u524d\u4f7f\u7528\u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"webpack")," \u63d2\u4ef6\uff0c\u5168\u90e8\u66f4\u6362\u4e3a ",(0,i.kt)("inlineCode",{parentName:"p"},"UnifiedWebpackPluginV5")," \u63d2\u4ef6\uff0c\u4e0d\u8fc7 ",(0,i.kt)("inlineCode",{parentName:"p"},"vite")," \u63d2\u4ef6\u7684\u5bfc\u51fa\u6709\u4e00\u4e9b\u5c0f\u53d8\u5316:"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"1.x"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"import vwt from 'weapp-tailwindcss-webpack-plugin/vite';\n")),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"2.x"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"// UnifiedViteWeappTailwindcssPlugin \u5c31\u662f\u65b0\u7684\u63d2\u4ef6\nimport { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss-webpack-plugin/vite';\n")),(0,i.kt)("p",null,"\u53e6\u5916\u65b0\u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"UnifiedWebpackPluginV5")," \u53ef\u4ee5\u76f4\u63a5\u4ece ",(0,i.kt)("inlineCode",{parentName:"p"},"weapp-tailwindcss-webpack-plugin")," \u5f15\u5165\uff0c\u540c\u65f6\u5728\u65b0\u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"UnifiedWebpackPluginV5")," \u4e2d\uff0c\u4e4b\u524d\u6240\u6709\u7684\u914d\u7f6e\u9879\u90fd\u88ab\u7ee7\u627f\u4e86\u8fc7\u6765\uff0c\u53ea\u9700\u8981\u7528\u5b83\u76f4\u63a5\u66ff\u6362\u539f\u5148\u63d2\u4ef6\u5373\u53ef\u3002"),(0,i.kt)("p",null,"\u53e6\u5916\u4e0d\u8981\u5fd8\u8bb0\u628a:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},' "scripts": {\n+  "postinstall": "weapp-tw patch"\n }\n')),(0,i.kt)("p",null,"\u6dfb\u52a0\u8fdb\u4f60\u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"package.json")," \u91cc\uff0c\u7136\u540e\u6e05\u9664\u539f\u5148\u7684\u6253\u5305\u7f13\u5b58\u4e4b\u540e\u91cd\u65b0\u6253\u5305\u8fd0\u884c\u3002"))}m.isMDXComponent=!0}}]);