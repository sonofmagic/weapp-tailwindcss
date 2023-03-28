"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[372],{9613:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>k});var i=n(9496);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},s=Object.keys(e);for(i=0;i<s.length;i++)n=s[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(i=0;i<s.length;i++)n=s[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=i.createContext({}),o=function(e){var t=i.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},c=function(e){var t=o(e.components);return i.createElement(p.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},m=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,s=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),d=o(n),m=a,k=d["".concat(p,".").concat(m)]||d[m]||u[m]||s;return n?i.createElement(k,r(r({ref:t},c),{},{components:n})):i.createElement(k,r({ref:t},c))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var s=n.length,r=new Array(s);r[0]=m;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[d]="string"==typeof e?e:a,r[1]=l;for(var o=2;o<s;o++)r[o]=n[o];return i.createElement.apply(null,r)}return i.createElement.apply(null,n)}m.displayName="MDXCreateElement"},4412:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>r,default:()=>u,frontMatter:()=>s,metadata:()=>l,toc:()=>o});var i=n(1163),a=(n(9496),n(9613));const s={},r="\u5b89\u88c5\u4e0e\u914d\u7f6e tailwindcss",l={unversionedId:"quick-start/install",id:"quick-start/install",title:"\u5b89\u88c5\u4e0e\u914d\u7f6e tailwindcss",description:"\u9996\u5148\u5b89\u88c5\u63d2\u4ef6\u4e4b\u524d\uff0c\u81ea\u7136\u662f\u9700\u8981\u628a tailwindcss \u5bf9\u5e94\u7684\u73af\u5883\u5b89\u88c5\u597d\u54af\u3002",source:"@site/docs/quick-start/install.md",sourceDirName:"quick-start",slug:"/quick-start/install",permalink:"/docs/quick-start/install",draft:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/dev/website/docs/quick-start/install.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"\u7b80\u4ecb",permalink:"/docs/intro"},next:{title:"rem \u8f6c rpx (\u6216 px)",permalink:"/docs/quick-start/rem2rpx"}},p={},o=[{value:"1. \u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5 <code>tailwindcss</code>",id:"1-\u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5-tailwindcss",level:2},{value:"2. \u521b\u5efa <code>postcss.config.js</code> \u5e76\u6ce8\u518c <code>tailwindcss</code>",id:"2-\u521b\u5efa-postcssconfigjs-\u5e76\u6ce8\u518c-tailwindcss",level:2},{value:"3. \u914d\u7f6e <code>tailwind.config.js</code>",id:"3-\u914d\u7f6e-tailwindconfigjs",level:2},{value:"4. \u5f15\u5165 <code>tailwindcss</code>",id:"4-\u5f15\u5165-tailwindcss",level:2}],c={toc:o},d="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(d,(0,i.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"\u5b89\u88c5\u4e0e\u914d\u7f6e-tailwindcss"},"\u5b89\u88c5\u4e0e\u914d\u7f6e tailwindcss"),(0,a.kt)("p",null,"\u9996\u5148\u5b89\u88c5\u63d2\u4ef6\u4e4b\u524d\uff0c\u81ea\u7136\u662f\u9700\u8981\u628a ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u5bf9\u5e94\u7684\u73af\u5883\u5b89\u88c5\u597d\u54af\u3002"),(0,a.kt)("p",null,"\u8fd9\u91cc\u6211\u4eec\u53c2\u8003 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u5b98\u7f51\u4e2d\uff0c",(0,a.kt)("inlineCode",{parentName:"p"},"postcss")," \u7684\u4f7f\u7528\u65b9\u5f0f\u8fdb\u884c\u5b89\u88c5 (",(0,a.kt)("a",{parentName:"p",href:"https://tailwindcss.com/docs/installation/using-postcss"},"\u53c2\u8003\u94fe\u63a5"),")\uff1a"),(0,a.kt)("h2",{id:"1-\u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5-tailwindcss"},"1. \u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5 ",(0,a.kt)("inlineCode",{parentName:"h2"},"tailwindcss")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"# \u4f7f\u7528\u4f60\u559c\u6b22\u7684 npm / yarn / pnpm \nnpm install -D tailwindcss postcss autoprefixer\n# \u521d\u59cb\u5316 tailwind.config.js \u6587\u4ef6\nnpx tailwindcss init\n")),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u6700\u65b0\u7248\u672c(",(0,a.kt)("inlineCode",{parentName:"p"},"3.x"),")\u5bf9\u5e94\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"postcss")," \u5927\u7248\u672c\u4e3a ",(0,a.kt)("inlineCode",{parentName:"p"},"8"),"\uff0c\u5047\u5982\u4f60\u4f7f\u7528\u8de8\u7aef\u6846\u67b6\uff0c\u5927\u6982\u7387\u5df2\u7ecf\u5185\u7f6e\u4e86 ",(0,a.kt)("inlineCode",{parentName:"p"},"postcss")," \u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"autoprefixer"))),(0,a.kt)("h2",{id:"2-\u521b\u5efa-postcssconfigjs-\u5e76\u6ce8\u518c-tailwindcss"},"2. \u521b\u5efa ",(0,a.kt)("inlineCode",{parentName:"h2"},"postcss.config.js")," \u5e76\u6ce8\u518c ",(0,a.kt)("inlineCode",{parentName:"h2"},"tailwindcss")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"// postcss.config.js\n// \u5047\u5982\u4f60\u4f7f\u7528\u7684\u6846\u67b6/\u5de5\u5177\u4e0d\u652f\u6301 postcss.config.js\uff0c\u5219\u53ef\u4ee5\u4f7f\u7528\u5185\u8054\u7684\u5199\u6cd5\n// \u5176\u4e2d `autoprefixer` \u6709\u53ef\u80fd\u5df2\u7ecf\u5185\u7f6e\u4e86\uff0c\u5047\u5982\u6846\u67b6\u5185\u7f6e\u4e86\u53ef\u4ee5\u53bb\u9664\nmodule.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  }\n}\n")),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"\u6ce8\u610f\uff1a\u8fd9\u53ea\u662f\u6bd4\u8f83\u666e\u904d\u7684\u6ce8\u518c\u65b9\u5f0f\uff0c\u5404\u4e2a\u6846\u67b6\u5f88\u6709\u53ef\u80fd\u662f\u4e0d\u540c\u7684\u3002",(0,a.kt)("br",{parentName:"p"}),"\n","\u50cf ",(0,a.kt)("inlineCode",{parentName:"p"},"uni-app vite vue3")," \u53ef\u80fd\u8981\u4f7f\u7528\u5185\u8054\u7684\u5199\u6cd5\uff0c\u8fd9\u70b9\u53ef\u4ee5\u53c2\u8003\u6211\u7684\u8fd9\u4e2a\u6a21\u677f\u9879\u76ee: ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template"},"uni-app-vite-vue3-tailwind-vscode-template"),"\u3002",(0,a.kt)("br",{parentName:"p"}),"\n","\u800c ",(0,a.kt)("inlineCode",{parentName:"p"},"uni-app vue webpack5 alpha")," \u7248\u672c\u4e2d\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"postcss.config.js")," \u5df2\u7ecf\u5199\u4e86\u5f88\u591a\u63d2\u4ef6\u5728\u91cc\u9762\u4e86\uff0c\u8fd9\u4e2a\u914d\u7f6e\u53ef\u4ee5\u53c2\u8003 ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app-webpack5/postcss.config.js"},"uni-app-webpack5/postcss.config.js"))),(0,a.kt)("h2",{id:"3-\u914d\u7f6e-tailwindconfigjs"},"3. \u914d\u7f6e ",(0,a.kt)("inlineCode",{parentName:"h2"},"tailwind.config.js")),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"tailwind.config.js")," \u662f ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u7684\u914d\u7f6e\u6587\u4ef6\uff0c\u6211\u4eec\u53ef\u4ee5\u5728\u91cc\u9762\u914d\u7f6e ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss jit")," \u5f15\u64ce\u7684\u5404\u79cd\u884c\u4e3a\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  // \u8fd9\u91cc\u7ed9\u51fa\u4e86\u4e00\u4efd uni-app /taro \u901a\u7528\u793a\u4f8b\uff0c\u5177\u4f53\u8981\u6839\u636e\u4f60\u81ea\u5df1\u9879\u76ee\u7684\u76ee\u5f55\u7ed3\u6784\u8fdb\u884c\u914d\u7f6e\n  // \u4e0d\u5728 content \u5305\u62ec\u7684\u6587\u4ef6\u5185\u7f16\u5199\u7684 class\uff0c\u4e0d\u4f1a\u751f\u6210\u5bf9\u5e94\u7684\u5de5\u5177\u7c7b\n  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],\n  // \u5176\u4ed6\u914d\u7f6e\u9879\n  // ...\n  corePlugins: {\n    // \u4e0d\u9700\u8981 preflight\uff0c\u56e0\u4e3a\u8fd9\u4e3b\u8981\u662f\u7ed9 h5 \u7684\uff0c\u5982\u679c\u4f60\u8981\u540c\u65f6\u5f00\u53d1\u5c0f\u7a0b\u5e8f\u548c h5 \u7aef\uff0c\u4f60\u5e94\u8be5\u4f7f\u7528\u73af\u5883\u53d8\u91cf\u6765\u63a7\u5236\u5b83\n    preflight: false\n  }\n}\n")),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"\u53c2\u8003",(0,a.kt)("a",{parentName:"p",href:"https://tailwindcss.com/docs/configuration"},"\u5b98\u65b9\u5177\u4f53\u7684\u914d\u7f6e\u9879link"))),(0,a.kt)("h2",{id:"4-\u5f15\u5165-tailwindcss"},"4. \u5f15\u5165 ",(0,a.kt)("inlineCode",{parentName:"h2"},"tailwindcss")),(0,a.kt)("p",null,"\u5728\u4f60\u7684\u9879\u76ee\u5165\u53e3\u5f15\u5165 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")),(0,a.kt)("p",null,"\u6bd4\u5982 ",(0,a.kt)("inlineCode",{parentName:"p"},"uni-app")," \u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"App.vue")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-html"},"<style>\n@tailwind base;\n@tailwind utilities;\n/* \u4f7f\u7528 scss */\n/* @import 'tailwindcss/base'; */\n/* @import 'tailwindcss/utilities'; */\n</style>\n")),(0,a.kt)("p",null,"\u53c8\u6216\u8005 ",(0,a.kt)("inlineCode",{parentName:"p"},"Taro")," \u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"app.scss")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-scss"},"@import 'tailwindcss/base';\n@import 'tailwindcss/utilities';\n")),(0,a.kt)("p",null,"\u7136\u540e\u5728 ",(0,a.kt)("inlineCode",{parentName:"p"},"app.ts")," \u91cc\u5f15\u5165\u8fd9\u4e2a\u6837\u5f0f\u6587\u4ef6"),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"Q&A: \u4e3a\u4ec0\u4e48\u6ca1\u6709\u5f15\u5165 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss/components"),"? \u662f\u56e0\u4e3a\u91cc\u9762\u9ed8\u8ba4\u5b58\u653e\u7684\u662f pc \u7aef\u81ea\u9002\u5e94\u76f8\u5173\u7684\u6837\u5f0f\uff0c\u5bf9\u5c0f\u7a0b\u5e8f\u73af\u5883\u6765\u8bf4\u6ca1\u6709\u7528\u5904\u3002\u5982\u679c\u4f60\u6709 @layer components \u76f8\u5173\u7684\u5de5\u5177\u7c7b\u9700\u8981\u4f7f\u7528\uff0c\u53ef\u4ee5\u5f15\u5165\u3002")),(0,a.kt)("p",null,"\u8fd9\u6837 ",(0,a.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u7684\u5b89\u88c5\u4e0e\u914d\u7f6e\u5c31\u5b8c\u6210\u4e86\uff0c\u63a5\u4e0b\u6765\u8ba9\u6211\u4eec\u8fdb\u5165\u7b2c\u4e8c\u4e2a\u73af\u8282\u3002"))}u.isMDXComponent=!0}}]);