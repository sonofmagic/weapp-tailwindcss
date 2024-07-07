"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[8610],{43:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>c,default:()=>h,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var a=n(6106),r=n(9252),s=n(7953),l=n(8101);const i={},c="2. \u5b89\u88c5\u8fd9\u4e2a\u63d2\u4ef6",o={id:"quick-start/this-plugin",title:"2. \u5b89\u88c5\u8fd9\u4e2a\u63d2\u4ef6",description:"\u5728\u9879\u76ee\u76ee\u5f55\u4e0b\uff0c\u6267\u884c:",source:"@site/docs/quick-start/this-plugin.mdx",sourceDirName:"quick-start",slug:"/quick-start/this-plugin",permalink:"/weapp-tailwindcss/docs/quick-start/this-plugin",draft:!1,unlisted:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/this-plugin.mdx",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"1. \u5b89\u88c5\u4e0e\u914d\u7f6e tailwindcss",permalink:"/weapp-tailwindcss/docs/quick-start/install"},next:{title:"uni-app cli vue2 webpack",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/uni-app"}},u={},d=[];function p(e){const t={admonition:"admonition",code:"code",h1:"h1",li:"li",ol:"ol",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t.h1,{id:"2-\u5b89\u88c5\u8fd9\u4e2a\u63d2\u4ef6",children:"2. \u5b89\u88c5\u8fd9\u4e2a\u63d2\u4ef6"}),"\n",(0,a.jsx)(t.p,{children:"\u5728\u9879\u76ee\u76ee\u5f55\u4e0b\uff0c\u6267\u884c:"}),"\n",(0,a.jsxs)(s.A,{children:[(0,a.jsx)(l.A,{label:"npm",value:"npm",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"npm i -D weapp-tailwindcss\n\n# \u5047\u5982 tailwindcss \u5728 weapp-tailwindcss \u4e4b\u540e\u5b89\u88c5\uff0c\u53ef\u4ee5\u624b\u52a8\u6267\u884c\u4e00\u4e0b patch \u65b9\u6cd5\n# npx weapp-tw patch\n"})})}),(0,a.jsx)(l.A,{label:"yarn",value:"yarn",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"yarn add -D weapp-tailwindcss\n\n# \u5047\u5982 tailwindcss \u5728 weapp-tailwindcss \u4e4b\u540e\u5b89\u88c5\uff0c\u53ef\u4ee5\u624b\u52a8\u6267\u884c\u4e00\u4e0b patch \u65b9\u6cd5\n# npx weapp-tw patch\n"})})}),(0,a.jsx)(l.A,{label:"pnpm",value:"pnpm",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"pnpm i -D weapp-tailwindcss\n\n# \u5047\u5982 tailwindcss \u5728 weapp-tailwindcss \u4e4b\u540e\u5b89\u88c5\uff0c\u53ef\u4ee5\u624b\u52a8\u6267\u884c\u4e00\u4e0b patch \u65b9\u6cd5\n# npx weapp-tw patch\n"})})})]}),"\n",(0,a.jsxs)(t.p,{children:["\u7136\u540e\u628a\u4e0b\u5217\u811a\u672c\uff0c\u6dfb\u52a0\u8fdb\u4f60\u7684 ",(0,a.jsx)(t.code,{children:"package.json"})," \u7684 ",(0,a.jsx)(t.code,{children:"scripts"})," \u5b57\u6bb5\u91cc:"]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-json",metastring:'title="package.json"',children:' "scripts": {\n    // highlight-next-line\n   "postinstall": "weapp-tw patch"\n }\n'})}),"\n",(0,a.jsxs)(t.admonition,{type:"info",children:[(0,a.jsxs)(t.p,{children:["\u6267\u884c ",(0,a.jsx)(t.code,{children:"weapp-tw patch"})," \u4e3b\u8981\u662f\u505a2\u4ef6\u4e8b\u60c5"]}),(0,a.jsxs)(t.ol,{children:["\n",(0,a.jsxs)(t.li,{children:["\u7ed9\u5f53\u524d\u4f60\u672c\u5730\u7684 ",(0,a.jsx)(t.code,{children:"tailwindcss"})," \u6253\u4e0a\u652f\u6301 ",(0,a.jsx)(t.code,{children:"rpx"})," \u7684\u8865\u4e01 (\u5c0f\u7a0b\u5e8f\u7279\u6709\u5355\u4f4d\uff0c\u975e ",(0,a.jsx)(t.code,{children:"web"})," \u6807\u51c6)"]}),"\n",(0,a.jsxs)(t.li,{children:["\u7528\u6765\u66b4\u9732 ",(0,a.jsx)(t.code,{children:"tailwindcss"})," \u8fd0\u884c\u4e0a\u4e0b\u6587\u7ed9 ",(0,a.jsx)(t.code,{children:"webpack"}),"/",(0,a.jsx)(t.code,{children:"vite"}),"/",(0,a.jsx)(t.code,{children:"glup"})," \u63d2\u4ef6\u3002"]}),"\n"]}),(0,a.jsxs)(t.p,{children:["\u800c\u6dfb\u52a0\u4e0a\u9762\u4e00\u6bb5 ",(0,a.jsx)(t.code,{children:"npm scripts"})," \u7684\u7528\u9014\u662f\uff0c\u5229\u7528 ",(0,a.jsx)(t.code,{children:"npm hook"}),", \u6bcf\u6b21\u5b89\u88c5\u5305\u540e\uff0c\u90fd\u4f1a\u81ea\u52a8\u6267\u884c\u4e00\u904d ",(0,a.jsx)(t.code,{children:"weapp-tw patch"})," \u8fd9\u4e2a\u811a\u672c\u3002"]}),(0,a.jsxs)(t.p,{children:["\u8fd9\u6837\u5373\u4f7f ",(0,a.jsx)(t.code,{children:"tailwindcss"})," \u66f4\u65b0\u4e86\u7248\u672c\u5bfc\u81f4\u4e86\u8865\u4e01\u5931\u6548\uff0c\u4e5f\u4f1a\u5728\u91cd\u65b0\u4e0b\u8f7d\u540e\uff0c\u7b2c\u4e00\u65f6\u95f4\u88ab\u6253\u4e0a\u3002"]})]}),"\n",(0,a.jsx)(t.p,{children:"\u6211\u4eec\u5df2\u7ecf\u5b8c\u6210\u4e86\u8fd9\u4e9b\u6b65\u9aa4\u4e86\uff0c\u6700\u540e\u5c31\u662f\u6ce8\u518c\u8fd9\u4e2a\u63d2\u4ef6\uff0c\u5230\u5404\u4e2a\u4e0d\u540c\u7684\u6846\u67b6\u91cc\u53bb\uff0c\u9a6c\u4e0a\u5c31\u597d\uff01"})]})}function h(e={}){const{wrapper:t}={...(0,r.R)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(p,{...e})}):p(e)}},8101:(e,t,n)=>{n.d(t,{A:()=>l});n(7378);var a=n(3372);const r={tabItem:"tabItem_CP1o"};var s=n(6106);function l(e){let{children:t,hidden:n,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,a.A)(r.tabItem,l),hidden:n,children:t})}},7953:(e,t,n)=>{n.d(t,{A:()=>k});var a=n(7378),r=n(3372),s=n(6436),l=n(505),i=n(1133),c=n(3425),o=n(2990),u=n(571);function d(e){return a.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,a.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:t,children:n}=e;return(0,a.useMemo)((()=>{const e=t??function(e){return d(e).map((e=>{let{props:{value:t,label:n,attributes:a,default:r}}=e;return{value:t,label:n,attributes:a,default:r}}))}(n);return function(e){const t=(0,o.X)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function h(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function m(e){let{queryString:t=!1,groupId:n}=e;const r=(0,l.W6)(),s=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,c.aZ)(s),(0,a.useCallback)((e=>{if(!s)return;const t=new URLSearchParams(r.location.search);t.set(s,e),r.replace({...r.location,search:t.toString()})}),[s,r])]}function b(e){const{defaultValue:t,queryString:n=!1,groupId:r}=e,s=p(e),[l,c]=(0,a.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!h({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const a=n.find((e=>e.default))??n[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:t,tabValues:s}))),[o,d]=m({queryString:n,groupId:r}),[b,f]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[r,s]=(0,u.Dv)(n);return[r,(0,a.useCallback)((e=>{n&&s.set(e)}),[n,s])]}({groupId:r}),w=(()=>{const e=o??b;return h({value:e,tabValues:s})?e:null})();(0,i.A)((()=>{w&&c(w)}),[w]);return{selectedValue:l,selectValue:(0,a.useCallback)((e=>{if(!h({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);c(e),d(e),f(e)}),[d,f,s]),tabValues:s}}var f=n(4159);const w={tabList:"tabList_NBdp",tabItem:"tabItem_KshN"};var x=n(6106);function j(e){let{className:t,block:n,selectedValue:a,selectValue:l,tabValues:i}=e;const c=[],{blockElementScrollPositionUntilNextRender:o}=(0,s.a_)(),u=e=>{const t=e.currentTarget,n=c.indexOf(t),r=i[n].value;r!==a&&(o(t),l(r))},d=e=>{let t=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const n=c.indexOf(e.currentTarget)+1;t=c[n]??c[0];break}case"ArrowLeft":{const n=c.indexOf(e.currentTarget)-1;t=c[n]??c[c.length-1];break}}t?.focus()};return(0,x.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,r.A)("tabs",{"tabs--block":n},t),children:i.map((e=>{let{value:t,label:n,attributes:s}=e;return(0,x.jsx)("li",{role:"tab",tabIndex:a===t?0:-1,"aria-selected":a===t,ref:e=>c.push(e),onKeyDown:d,onClick:u,...s,className:(0,r.A)("tabs__item",w.tabItem,s?.className,{"tabs__item--active":a===t}),children:n??t},t)}))})}function g(e){let{lazy:t,children:n,selectedValue:r}=e;const s=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=s.find((e=>e.props.value===r));return e?(0,a.cloneElement)(e,{className:"margin-top--md"}):null}return(0,x.jsx)("div",{className:"margin-top--md",children:s.map(((e,t)=>(0,a.cloneElement)(e,{key:t,hidden:e.props.value!==r})))})}function v(e){const t=b(e);return(0,x.jsxs)("div",{className:(0,r.A)("tabs-container",w.tabList),children:[(0,x.jsx)(j,{...t,...e}),(0,x.jsx)(g,{...t,...e})]})}function k(e){const t=(0,f.A)();return(0,x.jsx)(v,{...e,children:d(e.children)},String(t))}},9252:(e,t,n)=>{n.d(t,{R:()=>l,x:()=>i});var a=n(7378);const r={},s=a.createContext(r);function l(e){const t=a.useContext(s);return a.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function i(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),a.createElement(s.Provider,{value:t},e.children)}}}]);