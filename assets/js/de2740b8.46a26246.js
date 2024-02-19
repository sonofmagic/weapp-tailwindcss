"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[4546],{7942:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>f});var r=n(959);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var u=r.createContext({}),l=function(e){var t=r.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):p(p({},t),e)),n},c=function(e){var t=l(e.components);return r.createElement(u.Provider,{value:t},e.children)},s="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,u=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),s=l(n),m=i,f=s["".concat(u,".").concat(m)]||s[m]||d[m]||a;return n?r.createElement(f,p(p({ref:t},c),{},{components:n})):r.createElement(f,p({ref:t},c))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,p=new Array(a);p[0]=m;var o={};for(var u in t)hasOwnProperty.call(t,u)&&(o[u]=t[u]);o.originalType=e,o[s]="string"==typeof e?e:i,p[1]=o;for(var l=2;l<a;l++)p[l]=n[l];return r.createElement.apply(null,p)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},2499:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>p,default:()=>d,frontMatter:()=>a,metadata:()=>o,toc:()=>l});var r=n(8028),i=(n(959),n(7942));const a={},p="uni-app vue3 vite",o={unversionedId:"quick-start/frameworks/uni-app-vite",id:"quick-start/frameworks/uni-app-vite",title:"uni-app vue3 vite",description:"\u6ce8\u518c\u63d2\u4ef6",source:"@site/docs/quick-start/frameworks/uni-app-vite.md",sourceDirName:"quick-start/frameworks",slug:"/quick-start/frameworks/uni-app-vite",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/uni-app-vite",draft:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/frameworks/uni-app-vite.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"uni-app vue2 webpack",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/uni-app"},next:{title:"uni-app HbuilderX \u4f7f\u7528\u65b9\u5f0f",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/hbuilderx"}},u={},l=[{value:"\u6ce8\u518c\u63d2\u4ef6",id:"\u6ce8\u518c\u63d2\u4ef6",level:2},{value:"\u521b\u5efa\u9879\u76ee\u53c2\u8003",id:"\u521b\u5efa\u9879\u76ee\u53c2\u8003",level:2},{value:"\u89c6\u9891\u6f14\u793a",id:"\u89c6\u9891\u6f14\u793a",level:2}],c={toc:l},s="wrapper";function d(e){let{components:t,...n}=e;return(0,i.kt)(s,(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"uni-app-vue3-vite"},"uni-app vue3 vite"),(0,i.kt)("h2",{id:"\u6ce8\u518c\u63d2\u4ef6"},"\u6ce8\u518c\u63d2\u4ef6"),(0,i.kt)("p",null,"\u521b\u5efa\u5b8c\u6210\u540e\uff0c\u5feb\u901f\u4e0a\u624b\u4e2d\u7684\u51c6\u5907\u5de5\u4f5c\u90fd\u5b8c\u6210\u4e4b\u540e\uff0c\u5c31\u53ef\u4ee5\u4fbf\u6377\u7684\u6ce8\u518c\u4e86\uff1a"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"// vite.config.[jt]s\nimport { defineConfig } from \"vite\";\nimport uni from \"@dcloudio/vite-plugin-uni\";\nimport { UnifiedViteWeappTailwindcssPlugin as uvwt } from 'weapp-tailwindcss/vite';\n\nexport default defineConfig({\n  // uni \u662f uni-app \u5b98\u65b9\u63d2\u4ef6\uff0c uvtw \u4e00\u5b9a\u8981\u653e\u5728 uni \u540e\uff0c\u5bf9\u751f\u6210\u6587\u4ef6\u8fdb\u884c\u5904\u7406\n  plugins: [uni(),uvwt()],\n  css: {\n    postcss: {\n      plugins: [\n        // require('tailwindcss')() \u548c require('tailwindcss') \u7b49\u4ef7\u7684\uff0c\u8868\u793a\u4ec0\u4e48\u53c2\u6570\u90fd\u4e0d\u4f20\uff0c\u5982\u679c\u4f60\u60f3\u4f20\u5165\u53c2\u6570\n        // require('tailwindcss')({} <- \u8fd9\u4e2a\u662fpostcss\u63d2\u4ef6\u53c2\u6570)\n        require('tailwindcss'),\n        require('autoprefixer')\n      ],\n    },\n  },\n});\n\n")),(0,i.kt)("p",null,"\u8fd9\u91cc\u53ea\u5217\u4e3e\u4e86\u63d2\u4ef6\u7684\u6ce8\u518c\uff0c\u5305\u62ec",(0,i.kt)("inlineCode",{parentName:"p"},"postcss"),"\u914d\u7f6e\u5b8c\u6574\u7684\u6ce8\u518c\u65b9\u5f0f\uff0c\u53c2\u8003\u914d\u7f6e\u9879\u6587\u4ef6\u94fe\u63a5: ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template"},"https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template")),(0,i.kt)("h2",{id:"\u521b\u5efa\u9879\u76ee\u53c2\u8003"},"\u521b\u5efa\u9879\u76ee\u53c2\u8003"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"uni-app vite")," \u7248\u672c\u662f ",(0,i.kt)("inlineCode",{parentName:"p"},"uni-app")," \u6700\u65b0\u7684\u5347\u7ea7\uff0c\u5b83\u4f7f\u7528 ",(0,i.kt)("inlineCode",{parentName:"p"},"vue3")," \u7684\u8bed\u6cd5\u3002"),(0,i.kt)("p",null,"\u4f60\u53ef\u4ee5\u901a\u8fc7 ",(0,i.kt)("inlineCode",{parentName:"p"},"cli")," \u547d\u4ee4\u521b\u5efa\u9879\u76ee (",(0,i.kt)("a",{parentName:"p",href:"https://uniapp.dcloud.net.cn/quickstart-cli.html"},"\u53c2\u8003\u5b98\u7f51\u6587\u6863"),"):"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"\u521b\u5efa\u4ee5 javascript \u5f00\u53d1\u7684\u5de5\u7a0b\uff08\u5982\u547d\u4ee4\u884c\u521b\u5efa\u5931\u8d25\uff0c\u8bf7\u76f4\u63a5\u8bbf\u95ee gitee \u4e0b\u8f7d\u6a21\u677f\uff09")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"npx degit dcloudio/uni-preset-vue#vite my-vue3-project\n")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"\u521b\u5efa\u4ee5 typescript \u5f00\u53d1\u7684\u5de5\u7a0b\uff08\u5982\u547d\u4ee4\u884c\u521b\u5efa\u5931\u8d25\uff0c\u8bf7\u76f4\u63a5\u8bbf\u95ee gitee \u4e0b\u8f7d\u6a21\u677f\uff09")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"npx degit dcloudio/uni-preset-vue#vite-ts my-vue3-project\n")),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"gitee \u5730\u5740\u89c1\u4e0a\u65b9\u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"\u53c2\u8003\u5b98\u7f51\u6587\u6863")," \u94fe\u63a5\uff0c\u70b9\u51fb\u8df3\u8f6c\u5230 uni-app \u5b98\u7f51\u5373\u53ef")),(0,i.kt)("h2",{id:"\u89c6\u9891\u6f14\u793a"},"\u89c6\u9891\u6f14\u793a"),(0,i.kt)("iframe",{src:"//player.bilibili.com/player.html?aid=326378691&bvid=BV14w411773C&cid=1409199088&p=1&autoplay=0",scrolling:"no",border:"0",frameborder:"no",framespacing:"0",allowfullscreen:"true"}," "))}d.isMDXComponent=!0}}]);