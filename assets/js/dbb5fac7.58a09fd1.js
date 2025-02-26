"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[9443],{5718:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>o,default:()=>h,frontMatter:()=>c,metadata:()=>s,toc:()=>d});const s=JSON.parse('{"id":"quick-start/v4/weapp-vite","title":"Weapp-vite","description":"\u5b89\u88c5","source":"@site/docs/quick-start/v4/weapp-vite.mdx","sourceDirName":"quick-start/v4","slug":"/quick-start/v4/weapp-vite","permalink":"/weapp-tailwindcss/docs/quick-start/v4/weapp-vite","draft":false,"unlisted":false,"editUrl":"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/v4/weapp-vite.mdx","tags":[],"version":"current","frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"Vite","permalink":"/weapp-tailwindcss/docs/quick-start/v4/taro-vite"},"next":{"title":"Mpx","permalink":"/weapp-tailwindcss/docs/quick-start/v4/mpx"}}');var a=n(7557),r=n(6039),i=n(5388),l=n(6424);const c={},o="Weapp-vite",u={},d=[{value:"\u5b89\u88c5",id:"\u5b89\u88c5",level:2},{value:"\u914d\u7f6e",id:"\u914d\u7f6e",level:2},{value:"\u6dfb\u52a0\u6837\u5f0f",id:"\u6dfb\u52a0\u6837\u5f0f",level:2}];function p(e){const t={code:"code",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t.header,{children:(0,a.jsx)(t.h1,{id:"weapp-vite",children:"Weapp-vite"})}),"\n",(0,a.jsx)(t.h2,{id:"\u5b89\u88c5",children:"\u5b89\u88c5"}),"\n",(0,a.jsxs)(i.A,{groupId:"npm2yarn",children:[(0,a.jsx)(l.A,{value:"npm",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"npm install -D tailwindcss @tailwindcss/postcss postcss weapp-tailwindcss\n"})})}),(0,a.jsx)(l.A,{value:"yarn",label:"Yarn",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"yarn add --dev tailwindcss @tailwindcss/postcss postcss weapp-tailwindcss\n"})})}),(0,a.jsx)(l.A,{value:"pnpm",label:"pnpm",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"pnpm add -D tailwindcss @tailwindcss/postcss postcss weapp-tailwindcss\n"})})})]}),"\n",(0,a.jsx)(t.h2,{id:"\u914d\u7f6e",children:"\u914d\u7f6e"}),"\n",(0,a.jsxs)(t.p,{children:["\u66f4\u6539 ",(0,a.jsx)(t.code,{children:"vite.config.ts"})," \u6ce8\u518c ",(0,a.jsx)(t.code,{children:"weapp-tailwindcss"})]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-js",metastring:'title="vite.config.ts"',children:"import path from 'node:path'\nimport tailwindcss from '@tailwindcss/vite'\nimport { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'\nimport { defineConfig } from 'weapp-vite/config'\n\nexport default defineConfig({\n  plugins: [\n    UnifiedViteWeappTailwindcssPlugin({\n      rem2rpx: true,\n      tailwindcss: {\n        // \u663e\u793a\u58f0\u660e\u7528\u7684\u662f tailwindcss v4\n        version: 4,\n        v4: {\n          cssEntries: [\n            // app.css \u7684\u8def\u5f84\n            path.resolve(import.meta.dirname, './app.css'),\n          ],\n        },\n      },\n    }),\n  ],\n})\n"})}),"\n",(0,a.jsxs)(t.p,{children:["\u6dfb\u52a0 ",(0,a.jsx)(t.code,{children:"postcss.config.js"})," \u6ce8\u518c ",(0,a.jsx)(t.code,{children:"@tailwindcss/postcss"})]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-js",metastring:'title="postcss.config.js"',children:"export default {\n  plugins: {\n    '@tailwindcss/postcss': {},\n  },\n}\n"})}),"\n",(0,a.jsx)(t.h2,{id:"\u6dfb\u52a0\u6837\u5f0f",children:"\u6dfb\u52a0\u6837\u5f0f"}),"\n",(0,a.jsxs)(t.p,{children:["\u5728\u9879\u76ee\u76ee\u5f55\u4e0b\uff0c\u5c0f\u7a0b\u5e8f\u5168\u5c40\u7684 ",(0,a.jsx)(t.code,{children:"app.css"})," \u4e2d\uff0c\u6dfb\u52a0\u4ee5\u4e0b\u5185\u5bb9\uff1a"]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-css",metastring:'title="app.css"',children:'@import "weapp-tailwindcss";\n'})}),"\n",(0,a.jsx)(t.p,{children:"\u66f4\u6539\u597d\u914d\u7f6e\u4e4b\u540e\uff0c\u76f4\u63a5\u542f\u52a8\u5373\u53ef"})]})}function h(e={}){const{wrapper:t}={...(0,r.R)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(p,{...e})}):p(e)}},6424:(e,t,n)=>{n.d(t,{A:()=>i});n(8225);var s=n(3372);const a={tabItem:"tabItem_wDhu"};var r=n(7557);function i(e){let{children:t,hidden:n,className:i}=e;return(0,r.jsx)("div",{role:"tabpanel",className:(0,s.A)(a.tabItem,i),hidden:n,children:t})}},5388:(e,t,n)=>{n.d(t,{A:()=>y});var s=n(8225),a=n(3372),r=n(5025),i=n(1654),l=n(8595),c=n(2938),o=n(4995),u=n(1403);function d(e){return s.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,s.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:t,children:n}=e;return(0,s.useMemo)((()=>{const e=t??function(e){return d(e).map((e=>{let{props:{value:t,label:n,attributes:s,default:a}}=e;return{value:t,label:n,attributes:s,default:a}}))}(n);return function(e){const t=(0,o.XI)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function h(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function m(e){let{queryString:t=!1,groupId:n}=e;const a=(0,i.W6)(),r=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,c.aZ)(r),(0,s.useCallback)((e=>{if(!r)return;const t=new URLSearchParams(a.location.search);t.set(r,e),a.replace({...a.location,search:t.toString()})}),[r,a])]}function f(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,r=p(e),[i,c]=(0,s.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!h({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const s=n.find((e=>e.default))??n[0];if(!s)throw new Error("Unexpected error: 0 tabValues");return s.value}({defaultValue:t,tabValues:r}))),[o,d]=m({queryString:n,groupId:a}),[f,v]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,r]=(0,u.Dv)(n);return[a,(0,s.useCallback)((e=>{n&&r.set(e)}),[n,r])]}({groupId:a}),b=(()=>{const e=o??f;return h({value:e,tabValues:r})?e:null})();(0,l.A)((()=>{b&&c(b)}),[b]);return{selectedValue:i,selectValue:(0,s.useCallback)((e=>{if(!h({value:e,tabValues:r}))throw new Error(`Can't select invalid tab value=${e}`);c(e),d(e),v(e)}),[d,v,r]),tabValues:r}}var v=n(6497);const b={tabList:"tabList_TPiU",tabItem:"tabItem_ZYhA"};var w=n(7557);function g(e){let{className:t,block:n,selectedValue:s,selectValue:i,tabValues:l}=e;const c=[],{blockElementScrollPositionUntilNextRender:o}=(0,r.a_)(),u=e=>{const t=e.currentTarget,n=c.indexOf(t),a=l[n].value;a!==s&&(o(t),i(a))},d=e=>{let t=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const n=c.indexOf(e.currentTarget)+1;t=c[n]??c[0];break}case"ArrowLeft":{const n=c.indexOf(e.currentTarget)-1;t=c[n]??c[c.length-1];break}}t?.focus()};return(0,w.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":n},t),children:l.map((e=>{let{value:t,label:n,attributes:r}=e;return(0,w.jsx)("li",{role:"tab",tabIndex:s===t?0:-1,"aria-selected":s===t,ref:e=>{c.push(e)},onKeyDown:d,onClick:u,...r,className:(0,a.A)("tabs__item",b.tabItem,r?.className,{"tabs__item--active":s===t}),children:n??t},t)}))})}function x(e){let{lazy:t,children:n,selectedValue:r}=e;const i=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=i.find((e=>e.props.value===r));return e?(0,s.cloneElement)(e,{className:(0,a.A)("margin-top--md",e.props.className)}):null}return(0,w.jsx)("div",{className:"margin-top--md",children:i.map(((e,t)=>(0,s.cloneElement)(e,{key:t,hidden:e.props.value!==r})))})}function j(e){const t=f(e);return(0,w.jsxs)("div",{className:(0,a.A)("tabs-container",b.tabList),children:[(0,w.jsx)(g,{...t,...e}),(0,w.jsx)(x,{...t,...e})]})}function y(e){const t=(0,v.A)();return(0,w.jsx)(j,{...e,children:d(e.children)},String(t))}},6039:(e,t,n)=>{n.d(t,{R:()=>i,x:()=>l});var s=n(8225);const a={},r=s.createContext(a);function i(e){const t=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function l(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:i(e.components),s.createElement(r.Provider,{value:t},e.children)}}}]);