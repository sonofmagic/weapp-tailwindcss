"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[1305],{7942:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>k});var a=n(959);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var o=a.createContext({}),s=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},c=function(e){var t=s(e.components);return a.createElement(o.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,l=e.originalType,o=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),d=s(n),m=i,k=d["".concat(o,".").concat(m)]||d[m]||u[m]||l;return n?a.createElement(k,r(r({ref:t},c),{},{components:n})):a.createElement(k,r({ref:t},c))}));function k(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var l=n.length,r=new Array(l);r[0]=m;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p[d]="string"==typeof e?e:i,r[1]=p;for(var s=2;s<l;s++)r[s]=n[s];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},9235:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>r,default:()=>u,frontMatter:()=>l,metadata:()=>p,toc:()=>s});var a=n(8028),i=(n(959),n(7942));const l={},r="\u6784\u5efa\u4ee5\u53ca\u5f15\u5165\u5916\u90e8\u7ec4\u4ef6",p={unversionedId:"quick-start/build-or-import-outside-components",id:"quick-start/build-or-import-outside-components",title:"\u6784\u5efa\u4ee5\u53ca\u5f15\u5165\u5916\u90e8\u7ec4\u4ef6",description:"\u524d\u8a00",source:"@site/docs/quick-start/build-or-import-outside-components.md",sourceDirName:"quick-start",slug:"/quick-start/build-or-import-outside-components",permalink:"/weapp-tailwindcss/docs/quick-start/build-or-import-outside-components",draft:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/build-or-import-outside-components.md",tags:[],version:"current",frontMatter:{},sidebar:"communitySidebar",previous:{title:"uni-app \u6761\u4ef6\u7f16\u8bd1\u8bed\u6cd5\u7cd6\u63d2\u4ef6",permalink:"/weapp-tailwindcss/docs/quick-start/uni-app-css-macro"},next:{title:"tailwindcss \u591a\u4e0a\u4e0b\u6587\u4e0e\u72ec\u7acb\u5206\u5305",permalink:"/weapp-tailwindcss/docs/quick-start/independent-pkg"}},o={},s=[{value:"\u524d\u8a00",id:"\u524d\u8a00",level:2},{value:"\u6784\u5efa\u7ec4\u4ef6",id:"\u6784\u5efa\u7ec4\u4ef6",level:2},{value:"\u6838\u5fc3\u601d\u60f3",id:"\u6838\u5fc3\u601d\u60f3",level:3},{value:"\u53ef\u884c\u65b9\u6848",id:"\u53ef\u884c\u65b9\u6848",level:3},{value:"\u4e0d\u53ef\u884c\u65b9\u6848",id:"\u4e0d\u53ef\u884c\u65b9\u6848",level:3},{value:"\u53ef\u884c\u65b9\u6848\u8be6\u89e3",id:"\u53ef\u884c\u65b9\u6848\u8be6\u89e3",level:2},{value:"custom css selector + Functions &amp; Directives",id:"custom-css-selector--functions--directives",level:3},{value:"add prefix",id:"add-prefix",level:3},{value:"add scoped",id:"add-scoped",level:3},{value:"\u4e0d\u6253\u5305",id:"\u4e0d\u6253\u5305",level:3},{value:"\u6784\u5efademo\u94fe\u63a5",id:"\u6784\u5efademo\u94fe\u63a5",level:2},{value:"\u76f8\u5173 issues",id:"\u76f8\u5173-issues",level:2}],c={toc:s},d="wrapper";function u(e){let{components:t,...n}=e;return(0,i.kt)(d,(0,a.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"\u6784\u5efa\u4ee5\u53ca\u5f15\u5165\u5916\u90e8\u7ec4\u4ef6"},"\u6784\u5efa\u4ee5\u53ca\u5f15\u5165\u5916\u90e8\u7ec4\u4ef6"),(0,i.kt)("h2",{id:"\u524d\u8a00"},"\u524d\u8a00"),(0,i.kt)("p",null,"\u6211\u4eec\u5728\u65e5\u5e38\u7684\u5f00\u53d1\u4e2d\uff0c\u7ecf\u5e38\u4f1a\u53bb\u4f7f\u7528\u548c\u5c01\u88c5\u5404\u79cd\u5404\u6837\u7684\u7ec4\u4ef6\u5e93\u3002\u6709\u4e9b\u662f\u5f00\u6e90\u7684\uff0c\u7b2c\u4e09\u65b9\u5f00\u53d1\u7684UI\u5e93\uff0c\u6709\u4e9b\u662f\u6211\u4eec\u5f00\u53d1\u4eba\u5458\u7ed9\u81ea\u5df1\u7684\u7279\u5b9a\u7684\u4e1a\u52a1\u5c01\u88c5\u7684UI\u5e93\u3002\u5176\u4e2d\u5f88\u591a\u60c5\u51b5\u5176\u5b9e\u662f\u4ee5\u6d41\u884c\u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"\u5f00\u6e90UI\u5e93(\u6216\u8005fork\u7684\u6539\u7248)")," + ",(0,i.kt)("inlineCode",{parentName:"p"},"\u81ea\u5df1\u5c01\u88c5\u7684\u4e1a\u52a1\u7ec4\u4ef6\u4e3a\u4e3b\u7684")),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"\u5f00\u6e90UI\u5e93")," \u5b83\u4eec\u7684\u6837\u5f0f\u76f8\u5bf9\u6765\u8bf4\u662f\u72ec\u7acb\u4e8e\u6574\u5957\u7cfb\u7edf\u7684\uff0c\u6bd4\u5982\u5b83\u4eec\u7684\u6837\u5f0f\u90fd\u662f ",(0,i.kt)("inlineCode",{parentName:"p"},"ant-"),"\uff0c",(0,i.kt)("inlineCode",{parentName:"p"},"el-")," \u5f00\u5934\u7684\uff0c\u4e00\u822c\u5f15\u5165\u4e4b\u540e\u4e0d\u4f1a\u548c\u539f\u5148\u7cfb\u7edf\u91cc\u7684\u6837\u5f0f\u4ea7\u751f\u51b2\u7a81\u3002\u800c ",(0,i.kt)("inlineCode",{parentName:"p"},"\u81ea\u5df1\u5c01\u88c5\u7684\u4e1a\u52a1\u7ec4\u4ef6"),"\uff0c\u7531\u4e8e\u5f80\u5f80\u548c\u7cfb\u7edf\u9ad8\u5ea6\u7ed1\u5b9a\u4e5f\u6ca1\u6709\u8fd9\u6837\u7684\u95ee\u9898\u3002"),(0,i.kt)("p",null,"\u90a3\u4e48\u5982\u4f55\u7528 ",(0,i.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u6765\u6784\u5efa/\u53d1\u5e03\u548c\u5f15\u5165\u81ea\u5df1\u5c01\u88c5\u7684\u4e1a\u52a1\u7ec4\u4ef6\u5462\uff1f"),(0,i.kt)("h2",{id:"\u6784\u5efa\u7ec4\u4ef6"},"\u6784\u5efa\u7ec4\u4ef6"),(0,i.kt)("h3",{id:"\u6838\u5fc3\u601d\u60f3"},"\u6838\u5fc3\u601d\u60f3"),(0,i.kt)("p",null,"\u9996\u5148\u6211\u5fc5\u987b\u91cd\u70b9\u628a\u672c\u7bc7\u6587\u7ae0\u7684\u6838\u5fc3\u601d\u60f3\u9884\u5148\u629b\u51fa\uff1a"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u53ea\u662f\u4e00\u4e2a",(0,i.kt)("inlineCode",{parentName:"p"},"css"),"\u751f\u6210\u5668\uff0c\u5b83\u53ea\u662f\u5e2e\u4f60\u6309\u7167\u4e00\u5b9a\u7684\u89c4\u5219\uff0c\u4ece\u4f60\u7684\u6e90\u4ee3\u7801\u4e2d\u5339\u914d\u5b57\u7b26\u4e32\u53bb\u751f\u6210",(0,i.kt)("inlineCode",{parentName:"p"},"css"),"\u3002\u6240\u4ee5\u5728\u7528\u5b83\u53bb\u6784\u5efa\u7ec4\u4ef6\u7684\u65f6\u5019\uff0c\u4e00\u5b9a\u8981\u53bb\u601d\u8003\u4f60\u7528 ",(0,i.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u751f\u6210\u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"css")," \u7684\u5f71\u54cd\u8303\u56f4\uff0c\u56e0\u4e3a\u5927\u90e8\u5206\u7528 ",(0,i.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u90fd\u662f\u9ed8\u8ba4\u5168\u5c40\u5e94\u7528\u7684\u3002\u4f46\u662f\u4f60\u5728\u7ec4\u4ef6\u91cc\u9762\u7684\u81ea\u5b9a\u4e49\u6837\u5f0f\u5f88\u591a\u60c5\u51b5\u4e0b\uff0c\u662f\u6ca1\u6709\u5fc5\u8981\u7684\u3002"),(0,i.kt)("p",null,"\u6839\u636e\u8fd9\u4e2a\u6838\u5fc3\u601d\u60f3\uff0c\u6211\u4eec\u5c31\u53ef\u4ee5\u77e5\u9053\u5728\u5c01\u88c5\u7ec4\u4ef6\u65f6\u53ef\u884c\u548c\u4e0d\u53ef\u884c\u7684\u65b9\u5f0f\u4e86\uff0c\u5927\u81f4\u5982\u4e0b:"),(0,i.kt)("h3",{id:"\u53ef\u884c\u65b9\u6848"},"\u53ef\u884c\u65b9\u6848"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("inlineCode",{parentName:"li"},"custom css selector")," + ",(0,i.kt)("inlineCode",{parentName:"li"},"Functions & Directives")),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("inlineCode",{parentName:"li"},"add prefix")," (\u6dfb\u52a0\u524d\u7f00)"),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("inlineCode",{parentName:"li"},"add scoped")," (\u50cf ",(0,i.kt)("inlineCode",{parentName:"li"},"vue")," \u7684 ",(0,i.kt)("inlineCode",{parentName:"li"},"scoped")," \u4e00\u6837\u6dfb\u52a0 data-v-","[hash]"," \u7c7b\u4f3c\u7684\u81ea\u5b9a\u4e49\u5c5e\u6027\uff0c\u7136\u540e\u53bb\u4fee\u6539css\u9009\u62e9\u5668)"),(0,i.kt)("li",{parentName:"ol"},"\u4e0d\u6253\u5305\u65b9\u6848 (\u4e0d\u6784\u5efa\u4ea7\u7269\uff0c\u76f4\u63a5\u53d1\u5e03\uff0c\u7136\u540e\u5728\u9879\u76ee\u91cc\u5b89\u88c5\uff0c\u518d\u63d0\u53d6 ",(0,i.kt)("inlineCode",{parentName:"li"},"node_modules")," \u91cc\u5236\u5b9a\u7684\u6587\u672c\u91cd\u65b0\u751f\u6210\u3002)")),(0,i.kt)("h3",{id:"\u4e0d\u53ef\u884c\u65b9\u6848"},"\u4e0d\u53ef\u884c\u65b9\u6848"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"module css \u8fd9\u4f1a\u53bb\u4fee\u6539 css \u9009\u62e9\u5668\u3002")),(0,i.kt)("h2",{id:"\u53ef\u884c\u65b9\u6848\u8be6\u89e3"},"\u53ef\u884c\u65b9\u6848\u8be6\u89e3"),(0,i.kt)("p",null,"\u8fd9\u91cc\u6211\u5199\u4e862\u4e2a",(0,i.kt)("inlineCode",{parentName:"p"},"demo"),"\u5206\u522b\u662f ",(0,i.kt)("inlineCode",{parentName:"p"},"react")," \u548c ",(0,i.kt)("inlineCode",{parentName:"p"},"vue"),"\uff0c\u5176\u4e2d\u4e0b\u65b9\u4ee3\u7801\u4ee5 ",(0,i.kt)("inlineCode",{parentName:"p"},"vue")," \u4e3a\u793a\u4f8b\uff0c",(0,i.kt)("inlineCode",{parentName:"p"},"react"),"\u793a\u4f8b\u89c1\u4e0b\u65b9\u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"\u6784\u5efademo\u94fe\u63a5")),(0,i.kt)("h3",{id:"custom-css-selector--functions--directives"},"custom css selector + Functions & Directives"),(0,i.kt)("p",null,"\u8fd9\u79cd\u65b9\u6848\u5176\u5b9e\u975e\u5e38\u7684\u4f20\u7edf\uff0c\u4ec5\u4ec5\u4f7f\u7528\u5230\u4e86 ",(0,i.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u4e2d ",(0,i.kt)("inlineCode",{parentName:"p"},"@apply")," \u548c ",(0,i.kt)("inlineCode",{parentName:"p"},"theme")," \u7b49\u7b49\u6307\u4ee4\u7684\u529f\u80fd\u3002"),(0,i.kt)("p",null,"\u6bd4\u5982\u6211\u4eec\u6709\u4e2a\u7ec4\u4ef6 ",(0,i.kt)("inlineCode",{parentName:"p"},"ApplyButton.vue"),"\uff0c\u5b83\u7684\u6a21\u677f\uff0c\u6837\u5f0f\u548c\u72ec\u7acb\u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"tailwind.config.js")," \u5206\u522b\u5982\u4e0b\u6240\u793a:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<script setup lang="ts">\n<\/script>\n\n<template>\n  <button class="apply-button">ApplyButton</button>\n</template>\n\n<style src="./index.css"></style>\n')),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-css"},"@config 'tailwind.config.js';\n@tailwind utilities;\n\n.apply-button {\n  @apply text-white p-4 rounded;\n  background-color: theme(\"colors.sky.600\")\n}\n")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const path = require('node:path')\n\n/** @type {import('tailwindcss').Config} */\nexport default {\n  content: [path.resolve(__dirname, './index.vue')],\n  // ...\n}\n")),(0,i.kt)("p",null,"\u7136\u540e\u5728\u6253\u5305\u7684\u65f6\u5019\uff0c\u4ee5\u8fd9\u4e2a\u6587\u4ef6\u6216\u8005\u5bfc\u51fa\u6587\u4ef6(",(0,i.kt)("inlineCode",{parentName:"p"},"index.ts"),") \u4e3a\u6253\u5305\u5165\u53e3\u5373\u53ef\u3002"),(0,i.kt)("p",null,"\u8fd9\u6837\u5b83\u7684\u4ea7\u7269css\u4e2d\uff0c\u9009\u62e9\u5668\u7531\u4e8e\u662f\u4f60\u81ea\u5df1\u5b9a\u4e49\u7684\uff0c\u5c31\u80fd\u5c3d\u53ef\u80fd\u4fdd\u8bc1\u5b83\u662f\u72ec\u4e00\u65e0\u4e8c\u7684\u3002"),(0,i.kt)("p",null,"\u5b83\u5bf9\u5e94\u7684",(0,i.kt)("inlineCode",{parentName:"p"},"css"),"\u4ea7\u7269\u4e3a:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-css"},".apply-button {\n  border-radius: 0.25rem;\n  --tw-bg-opacity: 1;\n  background-color: rgb(2 132 199 / var(--tw-bg-opacity));\n  padding: 1rem;\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity));\n}\n")),(0,i.kt)("h3",{id:"add-prefix"},"add prefix"),(0,i.kt)("p",null,"\u8fd9\u4e2a\u4e5f\u5f88\u597d\u7406\u89e3\uff0c\u524d\u7f00\u561b\uff0c\u5404\u4e2aUI\u5e93\u90fd\u662f\u8fd9\u6837\u641e\u7684\uff0c\u6211\u4eec\u5c31\u53ef\u4ee5\u521b\u5efa\u51fa\u4ee5\u4e0b\u7684\u4ee3\u7801:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<script setup lang="ts">\n<\/script>\n\n<template>\n  <button class="ice-bg-sky-600 ice-text-white ice-p-4 ice-rounded">PrefixButton</button>\n</template>\n\n<style>\n@config \'tailwind.config.js\';\n@tailwind utilities;\n</style>\n')),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const path = require('node:path')\n\n/** @type {import('tailwindcss').Config} */\nexport default {\n  prefix: 'ice-',\n  content: [path.resolve(__dirname, './index.vue')],\n}\n")),(0,i.kt)("p",null,"\u5b83\u5bf9\u5e94\u7684",(0,i.kt)("inlineCode",{parentName:"p"},"css"),"\u4ea7\u7269\u4e3a:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-css"},".ice-rounded {\n  border-radius: 0.25rem;\n}\n.ice-bg-sky-600 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(2 132 199 / var(--tw-bg-opacity));\n}\n.ice-p-4 {\n  padding: 1rem;\n}\n.ice-text-white {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity));\n}\n")),(0,i.kt)("h3",{id:"add-scoped"},"add scoped"),(0,i.kt)("p",null,"\u8fd9\u4e2a\u5c31\u662f\u901a\u8fc7\u540c\u65f6\u6dfb\u52a0html\u6807\u7b7e\u5c5e\u6027\u548c\u4fee\u6539css\u9009\u62e9\u5668\u6765\u505a\u7684\u4e86:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<script setup lang="ts">\n<\/script>\n\n<template>\n  <button class="bg-sky-600 text-white p-4 rounded">ScopedButton</button>\n</template>\n\n<style scoped>\n@config \'tailwind.config.js\';\n@tailwind utilities;\n</style>\n')),(0,i.kt)("p",null,"\u8fd9\u91cc\u4ec5\u4ec5\u7ed9 ",(0,i.kt)("inlineCode",{parentName:"p"},"style")," \u52a0\u4e86\u4e00\u4e2a ",(0,i.kt)("inlineCode",{parentName:"p"},"scoped")," \u5c5e\u6027"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const path = require('node:path')\n\n/** @type {import('tailwindcss').Config} */\nexport default {\n  content: [path.resolve(__dirname, './index.vue')],\n}\n")),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"css")," \u751f\u6210\u7ed3\u679c\u4e3a:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-css"},".rounded[data-v-10205a53] {\n  border-radius: 0.25rem;\n}\n.bg-sky-600[data-v-10205a53] {\n  --tw-bg-opacity: 1;\n  background-color: rgb(2 132 199 / var(--tw-bg-opacity));\n}\n.p-4[data-v-10205a53] {\n  padding: 1rem;\n}\n.text-white[data-v-10205a53] {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity));\n}\n")),(0,i.kt)("h3",{id:"\u4e0d\u6253\u5305"},"\u4e0d\u6253\u5305"),(0,i.kt)("p",null,"\u4ee5\u4e0a\u4e09\u79cd\u65b9\u5f0f\u603b\u7ed3\u4e00\u4e0b\uff0c\u90fd\u662f\u901a\u8fc7\u5728\u9009\u62e9\u5668\u4e0a\u4e0b\u529f\u592b\u6765\u5236\u4f5c\u7ec4\u4ef6\u5e93\u7684\uff0c\u800c\u4e14\u5b83\u4eec\u90fd\u6709\u4e00\u4e2a\u6253\u5305\u7684\u8fc7\u7a0b\uff0c\u5373 ",(0,i.kt)("inlineCode",{parentName:"p"},"src"),"->",(0,i.kt)("inlineCode",{parentName:"p"},"dist")," \u7136\u540e\u53d1\u5e03 ",(0,i.kt)("inlineCode",{parentName:"p"},"dist")),(0,i.kt)("p",null,"\u53ef\u662f\u8fd9\u7b2c\u56db\u79cd\u65b9\u6848\u5c31\u4e0d\u600e\u4e48\u4e00\u6837\u4e86: \u6838\u5fc3\u5c31\u662f ",(0,i.kt)("inlineCode",{parentName:"p"},"\u4e0d\u6253\u5305")),(0,i.kt)("p",null,"\u5373\u6211\u4eec\u5199\u597d\u7ec4\u4ef6\u4e4b\u540e\uff0c\u76f4\u63a5\u628a ",(0,i.kt)("inlineCode",{parentName:"p"},"npm"),"\u7684\u5165\u53e3\u6587\u4ef6\uff0c\u6307\u5411 ",(0,i.kt)("inlineCode",{parentName:"p"},"src")," \uff0c\u7136\u540e\u76f4\u63a5\u628a\u91cc\u9762\u7684\u7ec4\u4ef6\u53d1\u5e03(\u6bd4\u5982\u76f4\u63a5\u53d1\u5e03 ",(0,i.kt)("inlineCode",{parentName:"p"},"vue"),"\u7ec4\u4ef6)"),(0,i.kt)("p",null,"\u8fd9\u79cd\u60c5\u51b5\u4e0b\uff0c\u4f60\u9700\u8981\u8ba9\u4f60\u5728 ",(0,i.kt)("inlineCode",{parentName:"p"},"node_modules")," \u91cc\u7684\u7ec4\u4ef6\u518d\u6b21\u7ecf\u53d7\u4e00\u904d ",(0,i.kt)("inlineCode",{parentName:"p"},"js")," \u7684\u5904\u7406\uff0c\u6bd4\u5982 ",(0,i.kt)("inlineCode",{parentName:"p"},"vue sfc compiler"),",",(0,i.kt)("inlineCode",{parentName:"p"},"babel"),",",(0,i.kt)("inlineCode",{parentName:"p"},"swc"),"\u7b49\u7b49\u3002"),(0,i.kt)("p",null,"\u540c\u65f6\u4f60\u4e5f\u9700\u8981\u914d\u7f6e\u4f60\u9879\u76ee\u91cc\u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"tailwind.config.js")," \u53bb\u63d0\u53d6\u4f60 ",(0,i.kt)("inlineCode",{parentName:"p"},"node_modules")," \u91cc\u7684\u7ec4\u4ef6\u6e90\u4ee3\u7801\u5185\u5bb9:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-diff"},"module.exports = {\n  content: [\n    './index.html',\n    './src/**/*.{html,js,ts,jsx,tsx,vue}',\n+   './node_modules/mypkg/src/components/**/*.{html,js,ts,jsx,tsx,vue}'\n  ]\n}\n")),(0,i.kt)("p",null,"\u8fd9\u6837\u624d\u80fd\u91cd\u65b0\u63d0\u53d6\u751f\u6210 ",(0,i.kt)("inlineCode",{parentName:"p"},"css")," \u5728\u9879\u76ee\u4e3b",(0,i.kt)("inlineCode",{parentName:"p"},"css chunk"),"\u91cc\u3002"),(0,i.kt)("h2",{id:"\u6784\u5efademo\u94fe\u63a5"},"\u6784\u5efademo\u94fe\u63a5"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/how-to-build-components-by-tailwindcss"},"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/how-to-build-components-by-tailwindcss")),(0,i.kt)("h2",{id:"\u76f8\u5173-issues"},"\u76f8\u5173 issues"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/weapp-tailwindcss/issues/247"},"https://github.com/sonofmagic/weapp-tailwindcss/issues/247")))}u.isMDXComponent=!0}}]);