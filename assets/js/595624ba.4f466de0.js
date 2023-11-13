"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[3752],{7942:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>f});var r=n(959);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),c=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},l=function(e){var t=c(e.components);return r.createElement(p.Provider,{value:t},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),m=c(n),u=a,f=m["".concat(p,".").concat(u)]||m[u]||d[u]||o;return n?r.createElement(f,i(i({ref:t},l),{},{components:n})):r.createElement(f,i({ref:t},l))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=u;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s[m]="string"==typeof e?e:a,i[1]=s;for(var c=2;c<o;c++)i[c]=n[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},3371:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>d,frontMatter:()=>o,metadata:()=>s,toc:()=>c});var r=n(8028),a=(n(959),n(7942));const o={},i="Nodejs API",s={unversionedId:"quick-start/frameworks/api",id:"quick-start/frameworks/api",title:"Nodejs API",description:"\u7248\u672c 2.11.0+",source:"@site/docs/quick-start/frameworks/api.md",sourceDirName:"quick-start/frameworks",slug:"/quick-start/frameworks/api",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/api",draft:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/dev/website/docs/quick-start/frameworks/api.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"hbuilderx \u4f7f\u7528\u65b9\u5f0f",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/hbuilderx"},next:{title:"\u5f00\u7bb1\u5373\u7528\u7684\u5c0f\u7a0b\u5e8ficon\u89e3\u51b3\u65b9\u6848",permalink:"/weapp-tailwindcss/docs/icons/"}},p={},c=[{value:"\u5982\u4f55\u4f7f\u7528",id:"\u5982\u4f55\u4f7f\u7528",level:2}],l={toc:c},m="wrapper";function d(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"nodejs-api"},"Nodejs API"),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"\u7248\u672c 2.11.0+")),(0,a.kt)("p",null,"\u6709\u65f6\u5019,\u6211\u4eec\u4e0d\u4e00\u5b9a\u4f1a\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"webpack/vite/gulp"),"\uff0c\u53ef\u80fd\u662f\u76f4\u63a5\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"nodejs")," \u53bb\u6784\u5efa\u5e94\u7528\uff0c\u8fd9\u65f6\u5019\u53ef\u4ee5\u4f7f\u7528\u8fd9\u79cd\u65b9\u5f0f\u53bb\u8f6c\u4e49\u4f60\u7684\u5e94\u7528\u3002"),(0,a.kt)("h2",{id:"\u5982\u4f55\u4f7f\u7528"},"\u5982\u4f55\u4f7f\u7528"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"// mjs or\nimport { createContext } from 'weapp-tailwindcss/core'\n// cjs\nconst { createContext } = require('weapp-tailwindcss/core')\n\nasync function main(){\n  // createContext \u53ef\u4f20\u5165\u53c2\u6570\uff0c\u7c7b\u578b\u4e3a UserDefinedOptions\n  const ctx = createContext()\n  // transformWxss \u662f\u5f02\u6b65\u7684\uff0c\u5176\u4ed62\u4e2a\u4e3a\u540c\u6b65\n  const wxssCode = await ctx.transformWxss(rawWxssCode)\n  const wxmlCode = ctx.transformWxml(rawWxmlCode)\n  const jsCode = ctx.transformJs(rawJsCode)\n  // \u4f20\u5165\u53c2\u6570\u548c\u8f93\u51fa\u7ed3\u679c\u5747\u4e3a \u5b57\u7b26\u4e32 string\n\n  // \u7136\u540e\u4f60\u5c31\u53ef\u4ee5\u6839\u636e\u7ed3\u679c\u53bb\u590d\u5199\u4f60\u7684\u6587\u4ef6\u4e86\n}\n\nmain()\n")),(0,a.kt)("admonition",{type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"\u6709\u4e00\u70b9\u8981\u7279\u522b\u6ce8\u610f\uff0c\u5728\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"ctx.transformJs")," \u7684\u65f6\u5019\uff0c\u4e00\u5b9a\u8981\u786e\u4fdd ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u5df2\u7ecf\u6267\u884c\u5b8c\u6bd5\u4e86\uff01\u4e5f\u5c31\u662f\u8bf4\u5bf9\u5e94\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"postcss")," \u6267\u884c\u5b8c\u6bd5\u3002"),(0,a.kt)("p",{parentName:"admonition"},"\u56e0\u4e3a ",(0,a.kt)("inlineCode",{parentName:"p"},"js")," \u7684\u8f6c\u4e49\u4f9d\u8d56 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u7684\u6267\u884c\u7ed3\u679c\uff0c\u7136\u540e\u6839\u636e\u5b83\uff0c\u518d\u53bb\u4ece\u4f60\u7684\u4ee3\u7801\u4e2d\u627e\u5230 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u63d0\u53d6\u51fa\u7684\u5b57\u7b26\u4e32\uff0c\u518d\u8fdb\u884c\u5904\u7406\u7684\u3002"),(0,a.kt)("p",{parentName:"admonition"},"\u5047\u5982\u6b64\u65f6 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u8fd8\u6ca1\u6709\u6267\u884c\uff0c\u5219\u63d2\u4ef6\u5c31\u53ea\u80fd\u83b7\u53d6\u5230\u4e00\u4e2a ",(0,a.kt)("strong",{parentName:"p"},"\u7a7a\u7684")," \u63d0\u53d6\u5b57\u7b26\u4e32\u96c6\u5408\uff0c\u8fd9\u5c31\u65e0\u6cd5\u8fdb\u884c\u5339\u914d\uff0c\u4ece\u800c\u5bfc\u81f4\u4f60\u5199\u5728 ",(0,a.kt)("inlineCode",{parentName:"p"},"js")," \u91cc\u7684\u7c7b\u540d\u8f6c\u4e49\u5931\u6548\u3002"),(0,a.kt)("p",{parentName:"admonition"},"\u6bd4\u5982\u8fd9\u79cd\u60c5\u51b5:"),(0,a.kt)("pre",{parentName:"admonition"},(0,a.kt)("code",{parentName:"pre",className:"language-js"},"// index.js\nconst classNames = ['mb-[1.5rem]']\n")),(0,a.kt)("p",{parentName:"admonition"},"\u53e6\u5916\u4f7f\u7528\u6b64\u79cd\u65b9\u5f0f\uff0c\u7f16\u8bd1\u7f13\u5b58\u9700\u8981\u81ea\u884c\u5904\u7406\uff0c\u4e14\u6682\u65f6\u6ca1\u6709\u7c7b\u540d\u7684\u538b\u7f29\u4e0e\u6df7\u6dc6\u529f\u80fd")))}d.isMDXComponent=!0}}]);