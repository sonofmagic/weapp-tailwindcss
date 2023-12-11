"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[3216],{7942:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>k});var i=n(959);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},l=Object.keys(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=i.createContext({}),s=function(e){var t=i.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},m=function(e){var t=s(e.components);return i.createElement(p.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,p=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),c=s(n),u=a,k=c["".concat(p,".").concat(u)]||c[u]||d[u]||l;return n?i.createElement(k,r(r({ref:t},m),{},{components:n})):i.createElement(k,r({ref:t},m))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,r=new Array(l);r[0]=u;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[c]="string"==typeof e?e:a,r[1]=o;for(var s=2;s<l;s++)r[s]=n[s];return i.createElement.apply(null,r)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},958:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>r,default:()=>d,frontMatter:()=>l,metadata:()=>o,toc:()=>s});var i=n(8028),a=(n(959),n(7942));const l={},r="\u4ece v2 \u8fc1\u79fb\u5230 v3",o={unversionedId:"migrations/v2",id:"migrations/v2",title:"\u4ece v2 \u8fc1\u79fb\u5230 v3",description:"v3 \u7248\u672c\u76f8\u6bd4\u4e8e v2, \u4e3b\u8981\u662f\u5220\u53bb\u4e00\u4e9b\u8fc7\u65f6\u7684\u529f\u80fd\uff0c\u914d\u7f6e\u9879\uff0c\u540c\u65f6\u4f1a\u6539\u53d8\u63d2\u4ef6\u7684\u9ed8\u8ba4\u503c\uff0c\u4f7f\u5f97\u6574\u4f53\u63d2\u4ef6\u53d8\u5f97\u66f4\u6613\u7528\uff0c\u66f4\u5bb9\u6613\u5b89\u88c5",source:"@site/docs/migrations/v2.md",sourceDirName:"migrations",slug:"/migrations/v2",permalink:"/weapp-tailwindcss/docs/migrations/v2",draft:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/dev/website/docs/migrations/v2.md",tags:[],version:"current",frontMatter:{},sidebar:"migrationsSidebar",next:{title:"\u4ece v1 \u8fc1\u79fb\u5230 v2",permalink:"/weapp-tailwindcss/docs/migrations/v1"}},p={},s=[{value:"\u914d\u7f6e\u9879\u6539\u52a8",id:"\u914d\u7f6e\u9879\u6539\u52a8",level:2},{value:"\u5220\u9664\u7684\u914d\u7f6e\u9879",id:"\u5220\u9664\u7684\u914d\u7f6e\u9879",level:3},{value:"\u589e\u52a0\u7684\u914d\u7f6e\u9879",id:"\u589e\u52a0\u7684\u914d\u7f6e\u9879",level:3},{value:"\u4e3a\u4ec0\u4e48\u9ed8\u8ba4\u4e0d\u5f00\u542f\uff1f",id:"\u4e3a\u4ec0\u4e48\u9ed8\u8ba4\u4e0d\u5f00\u542f",level:4},{value:"\u589e\u5f3a\u7684\u914d\u7f6e\u9879",id:"\u589e\u5f3a\u7684\u914d\u7f6e\u9879",level:3},{value:"\u4fee\u6539\u7684\u9ed8\u8ba4\u503c",id:"\u4fee\u6539\u7684\u9ed8\u8ba4\u503c",level:3},{value:"\u73b0\u5728\u9009\u9879\u5408\u5e76\uff0c\u6570\u7ec4\u9ed8\u8ba4\u884c\u4e3a\u53d8\u4e3a\u8986\u76d6\uff0c\u539f\u5148\u662f\u5408\u5e76",id:"\u73b0\u5728\u9009\u9879\u5408\u5e76\u6570\u7ec4\u9ed8\u8ba4\u884c\u4e3a\u53d8\u4e3a\u8986\u76d6\u539f\u5148\u662f\u5408\u5e76",level:3}],m={toc:s},c="wrapper";function d(e){let{components:t,...n}=e;return(0,a.kt)(c,(0,i.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"\u4ece-v2-\u8fc1\u79fb\u5230-v3"},"\u4ece v2 \u8fc1\u79fb\u5230 v3"),(0,a.kt)("p",null,"v3 \u7248\u672c\u76f8\u6bd4\u4e8e v2, \u4e3b\u8981\u662f\u5220\u53bb\u4e00\u4e9b\u8fc7\u65f6\u7684\u529f\u80fd\uff0c\u914d\u7f6e\u9879\uff0c\u540c\u65f6\u4f1a\u6539\u53d8\u63d2\u4ef6\u7684\u9ed8\u8ba4\u503c\uff0c\u4f7f\u5f97\u6574\u4f53\u63d2\u4ef6\u53d8\u5f97\u66f4\u6613\u7528\uff0c\u66f4\u5bb9\u6613\u5b89\u88c5\n\u5047\u5982\u4f60\u6ca1\u6709\u7528\u5230\u4ec0\u4e48\u590d\u6742\u81ea\u5b9a\u4e49\u914d\u7f6e\uff0c\u90a3\u4e48\u5b8c\u5168\u53ef\u4ee5\u5e73\u6ed1\u5347\u7ea7\u4e0a\u6765\u3002"),(0,a.kt)("h2",{id:"\u914d\u7f6e\u9879\u6539\u52a8"},"\u914d\u7f6e\u9879\u6539\u52a8"),(0,a.kt)("h3",{id:"\u5220\u9664\u7684\u914d\u7f6e\u9879"},"\u5220\u9664\u7684\u914d\u7f6e\u9879"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u5220\u53bb ",(0,a.kt)("inlineCode",{parentName:"li"},"replaceUniversalSelectorWith")," \u9009\u9879\uff0c\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"li"},"cssSelectorReplacement.universal")," \u6765\u4ee3\u66ff\uff0c\u540e\u8005\u53c2\u6570\u8986\u76d6\u524d\u8005"),(0,a.kt)("li",{parentName:"ul"},"\u5220\u53bb ",(0,a.kt)("inlineCode",{parentName:"li"},"minifiedJs")," \u9009\u9879\uff0c\u73b0\u5728\u5b8c\u5168\u9075\u4ece\u7528\u6237\u7684\u914d\u7f6e\uff0c\u7528\u6237\u538b\u7f29\u5c31\u538b\u7f29\uff0c\u53cd\u4e4b\u4ea6\u7136"),(0,a.kt)("li",{parentName:"ul"},"\u5220\u53bb ",(0,a.kt)("inlineCode",{parentName:"li"},"jsEscapeStrategy")," \u9009\u9879\uff0c\u73b0\u5728\u9ed8\u8ba4\u53ea\u6709\u4e00\u79cd\u6a21\u5f0f ",(0,a.kt)("inlineCode",{parentName:"li"},"replace"),"/  \u4e0d\u518d\u63d0\u4f9b ",(0,a.kt)("inlineCode",{parentName:"li"},"regenerate")," \u6a21\u5f0f"),(0,a.kt)("li",{parentName:"ul"},"\u5220\u53bb ",(0,a.kt)("inlineCode",{parentName:"li"},"customReplaceDictionary")," \u7684 ",(0,a.kt)("inlineCode",{parentName:"li"},"complex")," \u6a21\u5f0f\uff0c\u53ea\u5185\u7f6e ",(0,a.kt)("inlineCode",{parentName:"li"},"simple")," \u6a21\u5f0f (\u4f60\u5982\u679c\u8fd8\u8981 ",(0,a.kt)("inlineCode",{parentName:"li"},"complex")," \u6a21\u5f0f ,\u53ef\u4ee5\u4ece ",(0,a.kt)("inlineCode",{parentName:"li"},"@weapp-core/escape")," \u5f15\u5165\uff0c\u518d\u4f20\u5165 ",(0,a.kt)("inlineCode",{parentName:"li"},"customReplaceDictionary")," \u914d\u7f6e\u9879\u5373\u53ef)"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"cssMatcher"),"/",(0,a.kt)("inlineCode",{parentName:"li"},"htmlMatcher"),"/",(0,a.kt)("inlineCode",{parentName:"li"},"jsMatcher"),"/ ",(0,a.kt)("inlineCode",{parentName:"li"},"mainCssChunkMatcher")," / ",(0,a.kt)("inlineCode",{parentName:"li"},"wxsMatcher")," \u4e0d\u518d\u80fd\u591f\u4f20\u5165 ",(0,a.kt)("inlineCode",{parentName:"li"},"glob")," \u8868\u8fbe\u5f0f(\u4f8b\u5982",(0,a.kt)("inlineCode",{parentName:"li"},"**/*.html"),")\uff0c\u73b0\u5728\u90fd\u662f\u4f20\u5165\u4e00\u4e2a\u65b9\u6cd5: ",(0,a.kt)("inlineCode",{parentName:"li"},"(name: string) => boolean"),"\u3002\u8981\u517c\u5bb9\u539f\u5148\u7684 ",(0,a.kt)("inlineCode",{parentName:"li"},"glob")," \u8868\u8fbe\u5f0f\uff0c\u4f60\u53ef\u4ee5\u901a\u8fc7 ",(0,a.kt)("inlineCode",{parentName:"li"},"minimatch")," \u628a ",(0,a.kt)("inlineCode",{parentName:"li"},"glob")," \u8868\u8fbe\u5f0f\u8f6c\u5316\u6210\u6b63\u5219\u6765\u517c\u5bb9\u539f\u5148\u7684\u914d\u7f6e"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"cssPreflightRange")," \u53ea\u5b58\u5728\u4e00\u79cd\u6a21\u5f0f\uff0c\u4e3a ",(0,a.kt)("inlineCode",{parentName:"li"},"all"),", \u4e4b\u524d\u7684 ",(0,a.kt)("inlineCode",{parentName:"li"},"view")," \u9009\u9879\u4ea4\u7ed9 ",(0,a.kt)("inlineCode",{parentName:"li"},"cssSelectorReplacement.universal")," \u8fdb\u884c\u6258\u7ba1")),(0,a.kt)("h3",{id:"\u589e\u52a0\u7684\u914d\u7f6e\u9879"},"\u589e\u52a0\u7684\u914d\u7f6e\u9879"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"rem2rpx")," : \u7c7b\u578b ",(0,a.kt)("inlineCode",{parentName:"li"},"rem2rpx?: boolean | rem2rpxOptions"))),(0,a.kt)("p",null,"rem \u8f6c rpx \u914d\u7f6e\uff0c\u9ed8\u8ba4 ",(0,a.kt)("strong",{parentName:"p"},"\u4e0d\u5f00\u542f"),"\uff0c\u53ef\u4f20\u5165\u914d\u7f6e\u9879\uff0c\u914d\u7f6e\u9879\u89c1 ",(0,a.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/postcss-rem-to-responsive-pixel"},"https://www.npmjs.com/package/postcss-rem-to-responsive-pixel"),"\n\u8fd9\u4e2a\u914d\u7f6e\u9879\u4ee3\u8868\u63d2\u4ef6\u5185\u7f6e\u4e86 ",(0,a.kt)("inlineCode",{parentName:"p"},"postcss-rem-to-responsive-pixel")," \uff0c\u4e0d\u8fc7\u9ed8\u8ba4\u4e0d\u5f00\u542f\uff0c\u4f20\u5165\u4e00\u4e2a ",(0,a.kt)("inlineCode",{parentName:"p"},"true")," \u76f8\u5f53\u4e8e\u4f20\u5165\u914d\u7f6e:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"{\n  // 32 \u610f\u5473\u7740 1rem = 32rpx\n  rootValue: 32,\n  // \u9ed8\u8ba4\u6240\u6709\u5c5e\u6027\u90fd\u8f6c\u5316\n  propList: ['*'],\n  // \u8f6c\u5316\u7684\u5355\u4f4d,\u53ef\u4ee5\u53d8\u6210 px / rpx\n  transformUnit: 'rpx',\n}\n")),(0,a.kt)("p",null,"\u5f53\u7136\u4f60\u4e5f\u53ef\u4ee5\u4f20\u5165 ",(0,a.kt)("inlineCode",{parentName:"p"},"rem2rpxOptions")," \u8fd9\u6837\u4e00\u4e2a ",(0,a.kt)("inlineCode",{parentName:"p"},"object")," \u8fdb\u884c\u81ea\u5b9a\u4e49"),(0,a.kt)("h4",{id:"\u4e3a\u4ec0\u4e48\u9ed8\u8ba4\u4e0d\u5f00\u542f"},"\u4e3a\u4ec0\u4e48\u9ed8\u8ba4\u4e0d\u5f00\u542f\uff1f"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u4e3a\u4e86\u4ece ",(0,a.kt)("inlineCode",{parentName:"li"},"2.x")," \u7248\u672c\u53ef\u4ee5\u5e73\u6ed1\u7684\u8fc7\u6e21\u5230 ",(0,a.kt)("inlineCode",{parentName:"li"},"3.x")),(0,a.kt)("li",{parentName:"ol"},"\u4ece\u6211\u7684\u89c6\u89d2\u770b\uff0c\u5185\u7f6e ",(0,a.kt)("inlineCode",{parentName:"li"},"postcss")," \u63d2\u4ef6\u529f\u80fd\uff0c\u867d\u7136\u6574\u4f53\u96c6\u6210\u5ea6\u4e0a\u66f4\u9ad8\u4e86\uff0c\u4f46\u662f\u5bf9\u5176\u4ed6\u5f00\u53d1\u8005\u53ef\u80fd\u4e0d\u662f\u90a3\u4e48\u81ea\u7531\uff0c\u6bd4\u5982\u5728 ",(0,a.kt)("inlineCode",{parentName:"li"},"2.x")," \u65f6\u5019\uff0c\u7531\u4e8e ",(0,a.kt)("inlineCode",{parentName:"li"},"postcss-rem-to-responsive-pixel")," \u662f\u5916\u7f6e\u7684\uff0c\u6240\u4ee5\u5f00\u53d1\u8005\u53ef\u4ee5\u81ea\u7531\u7684\u51b3\u5b9a\u5b83\u7684\u52a0\u8f7d\u987a\u5e8f\u548c\u52a0\u8f7d\u903b\u8f91\uff0c\u4f46\u662f\u5185\u7f6e\u4e4b\u540e\u90fd\u662f\u6211\u51b3\u5b9a\u7684\u3002\u4e0d\u8fc7\u5185\u7f6e\u597d\u5904\u4e5f\u6709\uff0c\u5c31\u662f\u5f00\u7bb1\u5373\u7528")),(0,a.kt)("h3",{id:"\u589e\u5f3a\u7684\u914d\u7f6e\u9879"},"\u589e\u5f3a\u7684\u914d\u7f6e\u9879"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"cssChildCombinatorReplaceValue"),", ",(0,a.kt)("inlineCode",{parentName:"li"},"cssSelectorReplacement.root"),",",(0,a.kt)("inlineCode",{parentName:"li"},"cssSelectorReplacement.universal")," \u73b0\u5728\u90fd\u53ef\u4ee5\u63a5\u53d7\u5b57\u7b26\u4e32\u6570\u7ec4\u4e86\uff0c\u5b83\u4eec\u53ef\u4ee5\u81ea\u52a8\u5c55\u5f00\uff0c\u9632\u6b62\u9009\u62e9\u5668\u683c\u5f0f\u5316\u9519\u8bef\u95ee\u9898")),(0,a.kt)("h3",{id:"\u4fee\u6539\u7684\u9ed8\u8ba4\u503c"},"\u4fee\u6539\u7684\u9ed8\u8ba4\u503c"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"cssPreflightRange")," \u4ece ",(0,a.kt)("inlineCode",{parentName:"li"},"'view'")," \u53d8\u4e3a ",(0,a.kt)("inlineCode",{parentName:"li"},"undefined"),", \u73b0\u5728 ",(0,a.kt)("inlineCode",{parentName:"li"},"all")," \u7684\u4f5c\u7528\u53d8\u6210\u4e86\u5728 ",(0,a.kt)("inlineCode",{parentName:"li"},"tailwindcss")," \u53d8\u91cf\u6ce8\u5165\u533a\u57df\u7684\u9009\u62e9\u5668\uff0c\u6dfb\u52a0\u4e00\u4e2a ",(0,a.kt)("inlineCode",{parentName:"li"},":not(not)")," \u7684\u9009\u62e9\u5668\u4f5c\u4e3a\u5168\u5c40\u9009\u62e9\u5668\u7684\u66ff\u4ee3"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"cssSelectorReplacement.universal")," \u4ece ",(0,a.kt)("inlineCode",{parentName:"li"},"'view'")," \u53d8\u4e3a ",(0,a.kt)("inlineCode",{parentName:"li"},"['view', 'text']"),", \u8fd9\u610f\u5473\u7740 ",(0,a.kt)("inlineCode",{parentName:"li"},"*")," \u9009\u62e9\u5668\u4f1a\u88ab\u5c55\u5f00\u6210 ",(0,a.kt)("inlineCode",{parentName:"li"},"view,text")," \u4ee5\u53ca\u5bf9\u5e94\u65b9\u5f0f"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"cssChildCombinatorReplaceValue")," \u4ece ",(0,a.kt)("inlineCode",{parentName:"li"},"'view + view'")," \u53d8\u4e3a ",(0,a.kt)("inlineCode",{parentName:"li"},"['view']")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"replaceUniversalSelectorWith"),",",(0,a.kt)("inlineCode",{parentName:"li"},"jsEscapeStrategy"),",",(0,a.kt)("inlineCode",{parentName:"li"},"minifiedJs")," \u9009\u9879\u88ab\u5220\u9664\uff0c\u6240\u4ee5\u4e0d\u518d\u4fdd\u7559\u9ed8\u8ba4\u503c")),(0,a.kt)("h3",{id:"\u73b0\u5728\u9009\u9879\u5408\u5e76\u6570\u7ec4\u9ed8\u8ba4\u884c\u4e3a\u53d8\u4e3a\u8986\u76d6\u539f\u5148\u662f\u5408\u5e76"},"\u73b0\u5728\u9009\u9879\u5408\u5e76\uff0c\u6570\u7ec4\u9ed8\u8ba4\u884c\u4e3a\u53d8\u4e3a\u8986\u76d6\uff0c\u539f\u5148\u662f\u5408\u5e76"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const options = getOptions(input,defaults)\ndefaults: ['a','b'], input:['c'] \n// before: \noptions == ['a','b','c']\n// after:\noptions == ['c']\n")),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/weapp-tailwindcss/issues/259"},"https://github.com/sonofmagic/weapp-tailwindcss/issues/259")))}d.isMDXComponent=!0}}]);