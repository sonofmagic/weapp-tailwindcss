"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[8773],{6080:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>o,contentTitle:()=>c,default:()=>p,frontMatter:()=>a,metadata:()=>d,toc:()=>u});var i=s(6106),t=s(9252),l=s(4820),r=s(6054);const a={},c="1. \u5b89\u88c5\u4e0e\u914d\u7f6e tailwindcss",d={id:"quick-start/native/install",title:"1. \u5b89\u88c5\u4e0e\u914d\u7f6e tailwindcss",description:"\u524d\u8a00",source:"@site/docs/quick-start/native/0.install.mdx",sourceDirName:"quick-start/native",slug:"/quick-start/native/install",permalink:"/weapp-tailwindcss/docs/quick-start/native/install",draft:!1,unlisted:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/native/0.install.mdx",tags:[],version:"current",sidebarPosition:0,frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"4. rem \u8f6c rpx (\u6216 px)",permalink:"/weapp-tailwindcss/docs/quick-start/rem2rpx"},next:{title:"2. \u5b89\u88c5\u8fd9\u4e2a\u63d2\u4ef6\u5e76\u8fd0\u884c",permalink:"/weapp-tailwindcss/docs/quick-start/native/install-plugin"}},o={},u=[{value:"\u524d\u8a00",id:"\u524d\u8a00",level:2},{value:"\u524d\u7f6e\u8fd0\u884c\u73af\u5883",id:"\u524d\u7f6e\u8fd0\u884c\u73af\u5883",level:2},{value:"0. \u521d\u59cb\u5316 <code>package.json</code>",id:"0-\u521d\u59cb\u5316-packagejson",level:2},{value:"1. \u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5 <code>tailwindcss</code>",id:"1-\u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5-tailwindcss",level:2},{value:"2. \u914d\u7f6e <code>tailwind.config.js</code>",id:"2-\u914d\u7f6e-tailwindconfigjs",level:2},{value:"3. \u5728\u9879\u76ee\u76ee\u5f55\u4e0b\u521b\u5efa <code>postcss.config.js</code> \u5e76\u6ce8\u518c <code>tailwindcss</code>",id:"3-\u5728\u9879\u76ee\u76ee\u5f55\u4e0b\u521b\u5efa-postcssconfigjs-\u5e76\u6ce8\u518c-tailwindcss",level:2},{value:"4. \u5f15\u5165 <code>tailwindcss</code>",id:"4-\u5f15\u5165-tailwindcss",level:2}];function h(e){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",p:"p",pre:"pre",...(0,t.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h1,{id:"1-\u5b89\u88c5\u4e0e\u914d\u7f6e-tailwindcss",children:"1. \u5b89\u88c5\u4e0e\u914d\u7f6e tailwindcss"}),"\n",(0,i.jsx)(n.h2,{id:"\u524d\u8a00",children:"\u524d\u8a00"}),"\n",(0,i.jsxs)(n.p,{children:["\u5f88\u8363\u5e78\uff0c\u6211\u4eec\u5728 ",(0,i.jsx)(n.code,{children:"weapp-tailwindcss@3.2.0"})," \u7248\u672c\u5f00\u59cb\uff0c\u5f15\u5165\u4e86\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u539f\u751f\u652f\u6301\u7684\u80fd\u529b\u3002 (\u5176\u4ed6\u5e73\u53f0\u7684\u539f\u751f\u5c0f\u7a0b\u5e8f\u5f00\u53d1\uff0c\u4e5f\u975e\u5e38\u5bb9\u6613\u517c\u5bb9)"]}),"\n",(0,i.jsx)(n.p,{children:"\u63a5\u4e0b\u6765\u8ba9\u6211\u4eec\u770b\u770b\uff0c\u5982\u4f55\u8fdb\u884c\u4f7f\u7528\u5427\uff01"}),"\n",(0,i.jsxs)(n.p,{children:["\u672c\u6559\u7a0b\u6f14\u793a\u7684\u662f\uff0c\u4f7f\u7528\u5fae\u4fe1\u5f00\u53d1\u8005\u5de5\u5177\u521b\u5efa\u7684\u539f\u751f ",(0,i.jsx)(n.code,{children:"js"})," \u5c0f\u7a0b\u5e8f\uff0c\u4ee5\u53ca\u539f\u751f ",(0,i.jsx)(n.code,{children:"js"})," ",(0,i.jsx)(n.code,{children:"skyline"})," \u5c0f\u7a0b\u5e8f\u4f7f\u7528 ",(0,i.jsx)(n.code,{children:"tailwindcss"})," \u7684\u65b9\u5f0f"]}),"\n",(0,i.jsxs)(n.p,{children:["\u5982\u679c\u4f60\u4f7f\u7528 ",(0,i.jsx)(n.code,{children:"typescript"})," \u8fdb\u884c\u5c0f\u7a0b\u5e8f\u5f00\u53d1\uff0c\u4e5f\u53ef\u4ee5\u9075\u5faa\u672c\u6559\u7a0b\uff0c\u53ea\u9700\u8981\u6700\u540e\u66f4\u6539\u4e00\u4e0b ",(0,i.jsx)(n.code,{children:"weapp-tw.config.js"})," \u4e2d\u7684 ",(0,i.jsx)(n.code,{children:"src"})," \u914d\u7f6e\u4e3a ",(0,i.jsx)(n.code,{children:"miniprogram"})," \u5373\u53ef(\u76f8\u5bf9\u8def\u5f84)\u3002"]}),"\n",(0,i.jsx)(n.h2,{id:"\u524d\u7f6e\u8fd0\u884c\u73af\u5883",children:"\u524d\u7f6e\u8fd0\u884c\u73af\u5883"}),"\n",(0,i.jsxs)(n.p,{children:["\u8bf7\u786e\u4fdd\u4f60\u7684 ",(0,i.jsx)(n.code,{children:"nodejs"})," \u7248\u672c ",(0,i.jsx)(n.code,{children:">=16.6.0"}),"\u3002\u76ee\u524d\u4f4e\u4e8e ",(0,i.jsx)(n.code,{children:"16"})," \u7684\u957f\u671f\u7ef4\u62a4\u7248\u672c(",(0,i.jsx)(n.code,{children:"\u5076\u6570\u7248\u672c"}),") \u90fd\u5df2\u7ecf\u7ed3\u675f\u4e86\u751f\u547d\u5468\u671f\uff0c\u5efa\u8bae\u5b89\u88c5 ",(0,i.jsx)(n.code,{children:"nodejs"})," \u7684 ",(0,i.jsx)(n.code,{children:"LTS"})," \u7248\u672c\uff0c\u8be6\u89c1 ",(0,i.jsx)(n.a,{href:"https://github.com/nodejs/release",children:"nodejs/release"}),"\u3002"]}),"\n",(0,i.jsxs)(n.p,{children:["\u5047\u5982\u4f60\u5b89\u88c5\u7684 ",(0,i.jsx)(n.code,{children:"nodejs"})," \u592a\u65b0\uff0c\u53ef\u80fd\u4f1a\u51fa\u73b0\u5b89\u88c5\u5305\u4e0d\u517c\u5bb9\u7684\u95ee\u9898\uff0c\u8fd9\u65f6\u5019\u53ef\u4ee5\u6267\u884c\u5b89\u88c5\u547d\u4ee4\u65f6\uff0c\u4f7f\u7528 ",(0,i.jsx)(n.code,{children:"--ignore-engines"})," \u53c2\u6570\u8fdb\u884c ",(0,i.jsx)(n.code,{children:"nodejs"})," \u7248\u672c\u7684\u5ffd\u7565 \u3002"]}),"\n",(0,i.jsxs)(n.p,{children:["\u9996\u5148\u5b89\u88c5\u672c\u63d2\u4ef6\u524d\uff0c\u6211\u4eec\u9700\u8981\u628a ",(0,i.jsx)(n.code,{children:"tailwindcss"})," \u5bf9\u5e94\u7684\u73af\u5883\u548c\u914d\u7f6e\u5b89\u88c5\u597d\u3002"]}),"\n",(0,i.jsxs)(n.h2,{id:"0-\u521d\u59cb\u5316-packagejson",children:["0. \u521d\u59cb\u5316 ",(0,i.jsx)(n.code,{children:"package.json"})]}),"\n",(0,i.jsx)(n.p,{children:"\u9996\u5148\uff0c\u5047\u5982\u4f60\u4f7f\u7528\u539f\u751f\u7684 JS \u6a21\u677f\u521b\u5efa\u7684\u9879\u76ee\u3002"}),"\n",(0,i.jsxs)(n.p,{children:["\u5728\u521b\u5efa\u7684\u9879\u76ee\u76ee\u5f55\u4e0b\uff0c\u662f\u6ca1\u6709 ",(0,i.jsx)(n.code,{children:"package.json"})," \u6587\u4ef6 (",(0,i.jsx)(n.code,{children:"\u539f\u751f\u7684 TS \u6a21\u677f\u6709\u8fd9\u4e2a\u6587\u4ef6"}),"), \u4f60\u9700\u8981\u6267\u884c\u547d\u4ee4:"]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"npm init -y"}),"\uff0c\u5feb\u901f\u521b\u5efa\u4e00\u4e2a ",(0,i.jsx)(n.code,{children:"package.json"})," \u6587\u4ef6\u5728\u4f60\u7684\u9879\u76ee\u4e0b"]}),"\n",(0,i.jsxs)(n.h2,{id:"1-\u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5-tailwindcss",children:["1. \u4f7f\u7528\u5305\u7ba1\u7406\u5668\u5b89\u88c5 ",(0,i.jsx)(n.code,{children:"tailwindcss"})]}),"\n",(0,i.jsx)(n.p,{children:"\u7136\u540e\u6267\u884c:"}),"\n",(0,i.jsxs)(l.A,{children:[(0,i.jsx)(r.A,{label:"npm",value:"npm",children:(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"npm i -D tailwindcss postcss autoprefixer\n# \u521d\u59cb\u5316 tailwind.config.js \u6587\u4ef6\nnpx tailwindcss init\n"})})}),(0,i.jsx)(r.A,{label:"yarn",value:"yarn",children:(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"yarn add -D tailwindcss postcss\n# \u521d\u59cb\u5316 tailwind.config.js \u6587\u4ef6\nnpx tailwindcss init\n"})})}),(0,i.jsx)(r.A,{label:"pnpm",value:"pnpm",children:(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"pnpm i -D tailwindcss postcss\n# \u521d\u59cb\u5316 tailwind.config.js \u6587\u4ef6\nnpx tailwindcss init\n"})})})]}),"\n",(0,i.jsxs)(n.p,{children:["\u8fd9\u6837 ",(0,i.jsx)(n.code,{children:"tailwindcss"})," \u5c31\u88ab\u5b89\u88c5\u5230\u4f60\u9879\u76ee\u672c\u5730\u4e86"]}),"\n",(0,i.jsxs)(n.h2,{id:"2-\u914d\u7f6e-tailwindconfigjs",children:["2. \u914d\u7f6e ",(0,i.jsx)(n.code,{children:"tailwind.config.js"})]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"tailwind.config.js"})," \u662f ",(0,i.jsx)(n.code,{children:"tailwindcss"})," \u7684\u914d\u7f6e\u6587\u4ef6\uff0c\u6211\u4eec\u53ef\u4ee5\u5728\u91cc\u9762\u914d\u7f6e ",(0,i.jsx)(n.code,{children:"tailwindcss"})," \u7684\u5404\u79cd\u884c\u4e3a\u3002"]}),"\n",(0,i.jsxs)(n.p,{children:["\u8fd9\u91cc\u7ed9\u51fa\u4e86\u4e00\u4efd ",(0,i.jsx)(n.code,{children:"JS\u5fae\u4fe1\u5c0f\u7a0b\u5e8f"})," \u901a\u7528\u793a\u4f8b\uff0c\u5177\u4f53\u8981\u6839\u636e\u4f60\u81ea\u5df1\u9879\u76ee\u7684\u76ee\u5f55\u7ed3\u6784\u8fdb\u884c\u914d\u7f6e"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-js",metastring:'title="tailwind.config.js"',children:"/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: ['**/*.{js,ts,wxml}', '!node_modules/**', '!dist/**'],\n  // \u5047\u5982\u4f60\u4f7f\u7528 ts \u6a21\u677f\uff0c\u5219\u53ef\u4ee5\u4f7f\u7528\u4e0b\u65b9\u7684\u914d\u7f6e\n  // content: ['miniprogram/**/*.{ts,js,wxml}'],\n  corePlugins: {\n    // \u5c0f\u7a0b\u5e8f\u4e0d\u9700\u8981 preflight\uff0c\u56e0\u4e3a\u8fd9\u4e3b\u8981\u662f\u7ed9 h5 \u7684\uff0c\u5982\u679c\u4f60\u8981\u540c\u65f6\u5f00\u53d1\u5c0f\u7a0b\u5e8f\u548c h5 \u7aef\uff0c\u4f60\u5e94\u8be5\u4f7f\u7528\u73af\u5883\u53d8\u91cf\u6765\u63a7\u5236\u5b83\n    preflight: false\n  }\n}\n"})}),"\n",(0,i.jsxs)(n.h2,{id:"3-\u5728\u9879\u76ee\u76ee\u5f55\u4e0b\u521b\u5efa-postcssconfigjs-\u5e76\u6ce8\u518c-tailwindcss",children:["3. \u5728\u9879\u76ee\u76ee\u5f55\u4e0b\u521b\u5efa ",(0,i.jsx)(n.code,{children:"postcss.config.js"})," \u5e76\u6ce8\u518c ",(0,i.jsx)(n.code,{children:"tailwindcss"})]}),"\n",(0,i.jsx)(n.p,{children:"\u5185\u5bb9\u5982\u4e0b:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-js",metastring:'title="postcss.config.js"',children:"module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  }\n}\n"})}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:["\u8fd9\u4e2a\u6587\u4ef6\u548c ",(0,i.jsx)(n.code,{children:"tailwind.config.js"})," \u5e73\u7ea7"]}),"\n"]}),"\n",(0,i.jsxs)(n.h2,{id:"4-\u5f15\u5165-tailwindcss",children:["4. \u5f15\u5165 ",(0,i.jsx)(n.code,{children:"tailwindcss"})]}),"\n",(0,i.jsxs)(n.p,{children:["\u5728\u4f60\u7684\u5c0f\u7a0b\u5e8f\u9879\u76ee\u5165\u53e3 ",(0,i.jsx)(n.code,{children:"app.wxss"})," \u6587\u4ef6\u4e2d\uff0c\u5f15\u5165 ",(0,i.jsx)(n.code,{children:"tailwindcss"})," \u4f7f\u5b83\u5728\u5c0f\u7a0b\u5e8f\u5168\u5c40\u751f\u6548"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-css",children:"@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"})}),"\n",(0,i.jsxs)(n.p,{children:["\u5728 ",(0,i.jsx)(n.code,{children:"app.wxss"})," \u52a0\u5165\u8fd9\u4e00\u6bb5\u4ee3\u7801\u4e4b\u540e\uff0c\u5fae\u4fe1\u5f00\u53d1\u8005\u5de5\u5177\u4f1a\u62a5\u9519\u3002\u4e0d\u7528\u62c5\u5fc3\uff0c\u8fd9\u662f\u56e0\u4e3a\u6211\u4eec\u8fd8\u6ca1\u6709\u5b8c\u5168\u914d\u7f6e\u597d\u3002"]}),"\n",(0,i.jsxs)(n.p,{children:["\u63a5\u4e0b\u6765\uff0c\u8d76\u7d27\u8fdb\u5165\u4e0b\u4e00\u6b65\uff0c\u5b89\u88c5 ",(0,i.jsx)(n.code,{children:"weapp-tailwindcss"})," \u5e76\u8fd0\u884c\u5427\uff01"]})]})}function p(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},6054:(e,n,s)=>{s.d(n,{A:()=>r});s(7378);var i=s(3372);const t={tabItem:"tabItem_CP1o"};var l=s(6106);function r(e){let{children:n,hidden:s,className:r}=e;return(0,l.jsx)("div",{role:"tabpanel",className:(0,i.A)(t.tabItem,r),hidden:s,children:n})}},4820:(e,n,s)=>{s.d(n,{A:()=>k});var i=s(7378),t=s(3372),l=s(1016),r=s(505),a=s(3516),c=s(8412),d=s(9285),o=s(2465);function u(e){return i.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,i.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:s}=e;return(0,i.useMemo)((()=>{const e=n??function(e){return u(e).map((e=>{let{props:{value:n,label:s,attributes:i,default:t}}=e;return{value:n,label:s,attributes:i,default:t}}))}(s);return function(e){const n=(0,d.X)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,s])}function p(e){let{value:n,tabValues:s}=e;return s.some((e=>e.value===n))}function j(e){let{queryString:n=!1,groupId:s}=e;const t=(0,r.W6)(),l=function(e){let{queryString:n=!1,groupId:s}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!s)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return s??null}({queryString:n,groupId:s});return[(0,c.aZ)(l),(0,i.useCallback)((e=>{if(!l)return;const n=new URLSearchParams(t.location.search);n.set(l,e),t.replace({...t.location,search:n.toString()})}),[l,t])]}function x(e){const{defaultValue:n,queryString:s=!1,groupId:t}=e,l=h(e),[r,c]=(0,i.useState)((()=>function(e){let{defaultValue:n,tabValues:s}=e;if(0===s.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!p({value:n,tabValues:s}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${s.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const i=s.find((e=>e.default))??s[0];if(!i)throw new Error("Unexpected error: 0 tabValues");return i.value}({defaultValue:n,tabValues:l}))),[d,u]=j({queryString:s,groupId:t}),[x,f]=function(e){let{groupId:n}=e;const s=function(e){return e?`docusaurus.tab.${e}`:null}(n),[t,l]=(0,o.Dv)(s);return[t,(0,i.useCallback)((e=>{s&&l.set(e)}),[s,l])]}({groupId:t}),m=(()=>{const e=d??x;return p({value:e,tabValues:l})?e:null})();(0,a.A)((()=>{m&&c(m)}),[m]);return{selectedValue:r,selectValue:(0,i.useCallback)((e=>{if(!p({value:e,tabValues:l}))throw new Error(`Can't select invalid tab value=${e}`);c(e),u(e),f(e)}),[u,f,l]),tabValues:l}}var f=s(2968);const m={tabList:"tabList_NBdp",tabItem:"tabItem_KshN"};var w=s(6106);function b(e){let{className:n,block:s,selectedValue:i,selectValue:r,tabValues:a}=e;const c=[],{blockElementScrollPositionUntilNextRender:d}=(0,l.a_)(),o=e=>{const n=e.currentTarget,s=c.indexOf(n),t=a[s].value;t!==i&&(d(n),r(t))},u=e=>{let n=null;switch(e.key){case"Enter":o(e);break;case"ArrowRight":{const s=c.indexOf(e.currentTarget)+1;n=c[s]??c[0];break}case"ArrowLeft":{const s=c.indexOf(e.currentTarget)-1;n=c[s]??c[c.length-1];break}}n?.focus()};return(0,w.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,t.A)("tabs",{"tabs--block":s},n),children:a.map((e=>{let{value:n,label:s,attributes:l}=e;return(0,w.jsx)("li",{role:"tab",tabIndex:i===n?0:-1,"aria-selected":i===n,ref:e=>c.push(e),onKeyDown:u,onClick:o,...l,className:(0,t.A)("tabs__item",m.tabItem,l?.className,{"tabs__item--active":i===n}),children:s??n},n)}))})}function g(e){let{lazy:n,children:s,selectedValue:t}=e;const l=(Array.isArray(s)?s:[s]).filter(Boolean);if(n){const e=l.find((e=>e.props.value===t));return e?(0,i.cloneElement)(e,{className:"margin-top--md"}):null}return(0,w.jsx)("div",{className:"margin-top--md",children:l.map(((e,n)=>(0,i.cloneElement)(e,{key:n,hidden:e.props.value!==t})))})}function v(e){const n=x(e);return(0,w.jsxs)("div",{className:(0,t.A)("tabs-container",m.tabList),children:[(0,w.jsx)(b,{...n,...e}),(0,w.jsx)(g,{...n,...e})]})}function k(e){const n=(0,f.A)();return(0,w.jsx)(v,{...e,children:u(e.children)},String(n))}},9252:(e,n,s)=>{s.d(n,{R:()=>r,x:()=>a});var i=s(7378);const t={},l=i.createContext(t);function r(e){const n=i.useContext(l);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:r(e.components),i.createElement(l.Provider,{value:n},e.children)}}}]);