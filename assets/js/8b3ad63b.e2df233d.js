"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[1225],{9613:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>f});var a=n(9496);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=a.createContext({}),s=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},c=function(e){var t=s(e.components);return a.createElement(o.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),d=s(n),m=r,f=d["".concat(o,".").concat(m)]||d[m]||u[m]||i;return n?a.createElement(f,l(l({ref:t},c),{},{components:n})):a.createElement(f,l({ref:t},c))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=m;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p[d]="string"==typeof e?e:r,l[1]=p;for(var s=2;s<i;s++)l[s]=n[s];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},8441:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>p,toc:()=>s});var a=n(2564),r=(n(9496),n(9613));const i={id:"IMangleOptions",title:"Interface: IMangleOptions",sidebar_label:"IMangleOptions",sidebar_position:0,custom_edit_url:null},l=void 0,p={unversionedId:"api/interfaces/IMangleOptions",id:"api/interfaces/IMangleOptions",title:"Interface: IMangleOptions",description:"Properties",source:"@site/docs/api/interfaces/IMangleOptions.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/IMangleOptions",permalink:"/weapp-tailwindcss-webpack-plugin/docs/api/interfaces/IMangleOptions",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"IMangleOptions",title:"Interface: IMangleOptions",sidebar_label:"IMangleOptions",sidebar_position:0,custom_edit_url:null},sidebar:"API",previous:{title:"ILengthUnitsPatchOptions",permalink:"/weapp-tailwindcss-webpack-plugin/docs/api/interfaces/ILengthUnitsPatchOptions"},next:{title:"IMangleScopeContext",permalink:"/weapp-tailwindcss-webpack-plugin/docs/api/interfaces/IMangleScopeContext"}},o={},s=[{value:"Properties",id:"properties",level:2},{value:"classGenerator",id:"classgenerator",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"mangleClassFilter",id:"mangleclassfilter",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Parameters",id:"parameters",level:5},{value:"Returns",id:"returns",level:5},{value:"Defined in",id:"defined-in-1",level:4}],c={toc:s},d="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(d,(0,a.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"classgenerator"},"classGenerator"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"classGenerator"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"IClassGeneratorOptions")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/9ce0564/src/types.ts#L86"},"types.ts:86")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"mangleclassfilter"},"mangleClassFilter"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"mangleClassFilter"),": (",(0,r.kt)("inlineCode",{parentName:"p"},"className"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string"),") => ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,r.kt)("p",null,"\u25b8 (",(0,r.kt)("inlineCode",{parentName:"p"},"className"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("h5",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"className")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string"))))),(0,r.kt)("h5",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/9ce0564/src/types.ts#L87"},"types.ts:87")))}u.isMDXComponent=!0}}]);