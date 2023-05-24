"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[4991],{9613:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>f});var n=r(9496);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),u=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=u(e.components);return n.createElement(l.Provider,{value:t},e.children)},s="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),s=u(r),m=a,f=s["".concat(l,".").concat(m)]||s[m]||d[m]||i;return r?n.createElement(f,o(o({ref:t},c),{},{components:r})):n.createElement(f,o({ref:t},c))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=m;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[s]="string"==typeof e?e:a,o[1]=p;for(var u=2;u<i;u++)o[u]=r[u];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},8539:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>d,frontMatter:()=>i,metadata:()=>p,toc:()=>u});var n=r(2564),a=(r(9496),r(9613));const i={},o="hbuilderx \u4f7f\u7528\u65b9\u5f0f",p={unversionedId:"quick-start/frameworks/hbuilderx",id:"quick-start/frameworks/hbuilderx",title:"hbuilderx \u4f7f\u7528\u65b9\u5f0f",description:"\u8fd9\u91cc\u63a8\u8350\u76f4\u63a5\u4f7f\u7528\u6216\u8005\u53c2\u8003\u6a21\u677f: uni-app-vue3-tailwind-hbuilder-template",source:"@site/docs/quick-start/frameworks/hbuilderx.md",sourceDirName:"quick-start/frameworks",slug:"/quick-start/frameworks/hbuilderx",permalink:"/weapp-tailwindcss-webpack-plugin/docs/quick-start/frameworks/hbuilderx",draft:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/dev/website/docs/quick-start/frameworks/hbuilderx.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"\u539f\u751f\u5f00\u53d1(webpack5/gulp)",permalink:"/weapp-tailwindcss-webpack-plugin/docs/quick-start/frameworks/native"},next:{title:"\u4f7f\u7528 arbitrary values",permalink:"/weapp-tailwindcss-webpack-plugin/docs/options/arbitrary-values"}},l={},u=[],c={toc:u},s="wrapper";function d(e){let{components:t,...r}=e;return(0,a.kt)(s,(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"hbuilderx-\u4f7f\u7528\u65b9\u5f0f"},"hbuilderx \u4f7f\u7528\u65b9\u5f0f"),(0,a.kt)("p",null,"\u8fd9\u91cc\u63a8\u8350\u76f4\u63a5\u4f7f\u7528\u6216\u8005\u53c2\u8003\u6a21\u677f: ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/uni-app-vue3-tailwind-hbuilder-template"},"uni-app-vue3-tailwind-hbuilder-template")),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"hbuilderx")," \u6b63\u5f0f\u7248\u672c\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"vue2")," \u9879\u76ee\u63a8\u8350\u4f7f\u7528\u672c\u63d2\u4ef6\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"v1")," \u7248\u672c ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template"},"uni-app-vue2-tailwind-hbuilder-template")),(0,a.kt)("p",null,"\u53e6\u5916\u51fa\u4e8e\u5f00\u53d1\u4f53\u9a8c\u7684\u89d2\u5ea6\uff0c\u8fd8\u662f\u63a8\u8350\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"vscode")," \u4f5c\u4e3a\u4f60\u7684\u5f00\u53d1\u5de5\u5177\uff0c",(0,a.kt)("inlineCode",{parentName:"p"},"hbuilderx")," \u53ea\u7528\u4e8e\u8fdb\u884c\u539f\u751f\u53d1\u5e03\u8c03\u8bd5\u4e0e ",(0,a.kt)("inlineCode",{parentName:"p"},"ucloud")," \u90e8\u7f72\u7528\u3002"))}d.isMDXComponent=!0}}]);