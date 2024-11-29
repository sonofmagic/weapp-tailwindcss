"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[1577],{8303:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>u,contentTitle:()=>o,default:()=>h,frontMatter:()=>i,metadata:()=>t,toc:()=>d});const t=JSON.parse('{"id":"quick-start/css-unit-transform","title":"CSS \u5355\u4f4d\u8f6c\u5316","description":"rem \u8f6c rpx (\u6216 px)","source":"@site/docs/quick-start/css-unit-transform.mdx","sourceDirName":"quick-start","slug":"/quick-start/css-unit-transform","permalink":"/weapp-tailwindcss/docs/quick-start/css-unit-transform","draft":false,"unlisted":false,"editUrl":"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website/docs/quick-start/css-unit-transform.mdx","tags":[],"version":"current","frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"IDE \u667a\u80fd\u63d0\u793a\u8bbe\u7f6e","permalink":"/weapp-tailwindcss/docs/quick-start/intelliSense"},"next":{"title":"\u6df1\u5165\u6838\u5fc3\u539f\u7406","permalink":"/weapp-tailwindcss/docs/principle/"}}');var s=n(6106),a=n(2036),l=n(5872),c=n(883);const i={},o="CSS \u5355\u4f4d\u8f6c\u5316",u={},d=[{value:"rem \u8f6c rpx (\u6216 px)",id:"rem-\u8f6c-rpx-\u6216-px",level:2},{value:"px \u8f6c rpx",id:"px-\u8f6c-rpx",level:2},{value:"\u5b89\u88c5\u63d2\u4ef6",id:"\u5b89\u88c5\u63d2\u4ef6",level:3},{value:"\u6ce8\u518c\u5230 postcss \u914d\u7f6e\u4e2d",id:"\u6ce8\u518c\u5230-postcss-\u914d\u7f6e\u4e2d",level:3}];function p(e){const r={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",pre:"pre",...(0,a.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(r.header,{children:(0,s.jsx)(r.h1,{id:"css-\u5355\u4f4d\u8f6c\u5316",children:"CSS \u5355\u4f4d\u8f6c\u5316"})}),"\n",(0,s.jsx)(r.h2,{id:"rem-\u8f6c-rpx-\u6216-px",children:"rem \u8f6c rpx (\u6216 px)"}),"\n",(0,s.jsxs)(r.p,{children:["\u5728 ",(0,s.jsx)(r.a,{href:"/docs/quick-start/rem2rpx",children:"rem \u8f6c rpx (\u6216 px)"})," \u7ae0\u8282\uff0c\u6211\u4eec\u505a\u4e86 ",(0,s.jsx)(r.code,{children:"CSS"})," \u4e2d ",(0,s.jsx)(r.code,{children:"rem"})," \u8f6c\u5316\u6210 ",(0,s.jsx)(r.code,{children:"px"})," / ",(0,s.jsx)(r.code,{children:"rpx"})," \u7684\u65b9\u5f0f\u3002"]}),"\n",(0,s.jsxs)(r.p,{children:["\u4f46\u662f\u9664\u4e86 ",(0,s.jsx)(r.a,{href:"/docs/quick-start/rem2rpx",children:"rem \u8f6c rpx (\u6216 px)"}),"\uff0c\u6211\u4eec\u53ef\u80fd\u4e5f\u6709 ",(0,s.jsx)(r.code,{children:"px \u8f6c rpx"})," \u7684\u9700\u6c42\uff0c\u8fd9\u79cd\u60c5\u51b5\u5b9e\u9645\u4e0a\u4e5f\u5f88\u5bb9\u6613\u5c31\u80fd\u505a\u5230\u3002"]}),"\n",(0,s.jsx)(r.h2,{id:"px-\u8f6c-rpx",children:"px \u8f6c rpx"}),"\n",(0,s.jsxs)(r.p,{children:["\u8fd9\u91cc\u6211\u4eec\u4f7f\u7528 ",(0,s.jsx)(r.a,{href:"https://www.npmjs.com/package/postcss-pxtransform",children:(0,s.jsx)(r.code,{children:"postcss-pxtransform"})})," \u8fd9\u4e2a ",(0,s.jsx)(r.code,{children:"postcss"})," \u63d2\u4ef6\u6765\u505a\u3002"]}),"\n",(0,s.jsxs)(r.blockquote,{children:["\n",(0,s.jsxs)(r.p,{children:[(0,s.jsx)(r.a,{href:"https://www.npmjs.com/package/postcss-pxtransform",children:(0,s.jsx)(r.code,{children:"postcss-pxtransform"})})," \u7531\u4eac\u4e1c\u56e2\u961f\u51fa\u54c1\uff0c\u5e94\u8be5\u662f\u76ee\u524d\u8d28\u91cf\u6700\u9ad8\u7684 ",(0,s.jsx)(r.code,{children:"px"})," \u8f6c ",(0,s.jsx)(r.code,{children:"rpx"})," \u63d2\u4ef6\uff0c\u800c\u4e14\u5df2\u7ecf\u88ab\u5185\u7f6e\u5728\u4e86 ",(0,s.jsx)(r.code,{children:"tarojs"})," \u6846\u67b6\u5185"]}),"\n"]}),"\n",(0,s.jsx)(r.h3,{id:"\u5b89\u88c5\u63d2\u4ef6",children:"\u5b89\u88c5\u63d2\u4ef6"}),"\n","\n",(0,s.jsxs)(l.A,{children:[(0,s.jsx)(c.A,{label:"npm",value:"npm",children:(0,s.jsx)(r.pre,{children:(0,s.jsx)(r.code,{className:"language-bash",children:"npm i -D postcss-pxtransform\n"})})}),(0,s.jsx)(c.A,{label:"yarn",value:"yarn",children:(0,s.jsx)(r.pre,{children:(0,s.jsx)(r.code,{className:"language-bash",children:"yarn add -D postcss-pxtransform\n"})})}),(0,s.jsx)(c.A,{label:"pnpm",value:"pnpm",children:(0,s.jsx)(r.pre,{children:(0,s.jsx)(r.code,{className:"language-bash",children:"pnpm i -D postcss-pxtransform\n"})})})]}),"\n",(0,s.jsx)(r.h3,{id:"\u6ce8\u518c\u5230-postcss-\u914d\u7f6e\u4e2d",children:"\u6ce8\u518c\u5230 postcss \u914d\u7f6e\u4e2d"}),"\n",(0,s.jsx)(r.pre,{children:(0,s.jsx)(r.code,{className:"language-js",metastring:'title="postcss.config.js"',children:"module.exports = {\n  plugins: {\n    'tailwindcss': {},\n    'autoprefixer': {},\n    // highlight-start\n    // \u4e0b\u65b9\u4e3a px \u8f6c rpx \u533a\u57df\n    'postcss-pxtransform': {\n      platform: 'weapp',\n      // \u6839\u636e\u4f60\u7684\u8bbe\u8ba1\u7a3f\u5bbd\u5ea6\u8fdb\u884c\u914d\u7f6e\n      // \u53ef\u4ee5\u4f20\u5165\u4e00\u4e2a function\n      // designWidth (input) {\n      //   if (input.file.replace(/\\\\+/g, '/').indexOf('@nutui/nutui-taro') > -1) {\n      //     return 375\n      //   }\n      //   return 750\n      // },\n      designWidth: 750, // \u53ef\u4ee5\u8bbe\u7f6e\u4e3a 375 \u7b49\u7b49\u6765\u5e94\u7528\u4e0b\u65b9\u7684\u89c4\u5219,\n      deviceRatio: {\n        640: 2.34 / 2,\n        // \u6b64\u65f6\u5e94\u7528\u5230\u7684\u89c4\u5219\uff0c\u4ee3\u8868 1px = 1rpx\n        750: 1,\n        828: 1.81 / 2,\n        // \u5047\u5982\u4f60\u628a designWidth \u8bbe\u7f6e\u6210 375 \u5219\u4f7f\u7528\u8fd9\u6761\u89c4\u5219 1px = 2rpx\n        375: 2 / 1,\n      },\n    },\n    // highlight-end\n  },\n}\n\n"})}),"\n",(0,s.jsxs)(r.p,{children:["\u8fd9\u6837\u5c31\u80fd\u8fdb\u884c\u8f6c\u5316\u4e86\uff0c\u6b64\u65f6\u5047\u5982\u4f60\u5199 ",(0,s.jsx)(r.code,{children:"w-[20px]"})," \u8fd9\u79cd ",(0,s.jsx)(r.code,{children:"class"})," \u5b83\u6700\u7ec8\u751f\u6548\u7684\u6837\u5f0f\u4f1a\u7ecf\u8fc7 ",(0,s.jsx)(r.code,{children:"postcss-pxtransform"})," \u8f6c\u5316\uff0c\u8f6c\u53d8\u4e3a ",(0,s.jsx)(r.code,{children:"width: 20rpx"}),", \u5f53\u7136\u8fd9\u53d6\u51b3\u4e8e\u4f60\u4f20\u5165\u63d2\u4ef6\u7684\u914d\u7f6e\uff0c\u6bd4\u5982\u8bbe\u8ba1\u7a3f\u5bbd\u5ea6 (",(0,s.jsx)(r.code,{children:"designWidth"}),")"]}),"\n",(0,s.jsxs)(r.p,{children:["\u4f60\u53ef\u4ee5\u5728 ",(0,s.jsx)(r.a,{href:"https://taro-docs.jd.com/docs/size",children:"taro \u5b98\u7f51\u7684\u8bbe\u8ba1\u7a3f\u53ca\u5c3a\u5bf8\u5355\u4f4d\u7ae0\u8282\u5185"})," \u67e5\u770b\u8fd9\u4e2a\u63d2\u4ef6\u7684\u6240\u6709\u7528\u6cd5\u3002"]}),"\n",(0,s.jsxs)(r.p,{children:["\u53e6\u5916\uff0c\u5047\u5982\u4f60\u8981\u7981\u6b62\u5355\u4e2a\u6587\u4ef6 ",(0,s.jsx)(r.code,{children:"px"})," \u8f6c ",(0,s.jsx)(r.code,{children:"rpx"}),"\uff0c\u53ef\u4ee5\u5728\u6837\u5f0f\u8868\u6587\u4ef6\u5185\u5934\u90e8\uff0c\u6dfb\u52a0 ",(0,s.jsx)(r.code,{children:"/*postcss-pxtransform disable*/"})," \u8fd9\u6837\u7684\u6ce8\u89c6\uff0c\u7981\u7528\u8be5\u6587\u4ef6 ",(0,s.jsx)(r.code,{children:"px"})," \u8f6c ",(0,s.jsx)(r.code,{children:"rpx"}),"\u3002"]})]})}function h(e={}){const{wrapper:r}={...(0,a.R)(),...e.components};return r?(0,s.jsx)(r,{...e,children:(0,s.jsx)(p,{...e})}):p(e)}},883:(e,r,n)=>{n.d(r,{A:()=>l});n(7378);var t=n(3372);const s={tabItem:"tabItem_UwVq"};var a=n(6106);function l(e){let{children:r,hidden:n,className:l}=e;return(0,a.jsx)("div",{role:"tabpanel",className:(0,t.A)(s.tabItem,l),hidden:n,children:r})}},5872:(e,r,n)=>{n.d(r,{A:()=>k});var t=n(7378),s=n(3372),a=n(1971),l=n(505),c=n(3737),i=n(7188),o=n(9149),u=n(5323);function d(e){return t.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,t.isValidElement)(e)&&function(e){const{props:r}=e;return!!r&&"object"==typeof r&&"value"in r}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:r,children:n}=e;return(0,t.useMemo)((()=>{const e=r??function(e){return d(e).map((e=>{let{props:{value:r,label:n,attributes:t,default:s}}=e;return{value:r,label:n,attributes:t,default:s}}))}(n);return function(e){const r=(0,o.XI)(e,((e,r)=>e.value===r.value));if(r.length>0)throw new Error(`Docusaurus error: Duplicate values "${r.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[r,n])}function h(e){let{value:r,tabValues:n}=e;return n.some((e=>e.value===r))}function x(e){let{queryString:r=!1,groupId:n}=e;const s=(0,l.W6)(),a=function(e){let{queryString:r=!1,groupId:n}=e;if("string"==typeof r)return r;if(!1===r)return null;if(!0===r&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:r,groupId:n});return[(0,i.aZ)(a),(0,t.useCallback)((e=>{if(!a)return;const r=new URLSearchParams(s.location.search);r.set(a,e),s.replace({...s.location,search:r.toString()})}),[a,s])]}function m(e){const{defaultValue:r,queryString:n=!1,groupId:s}=e,a=p(e),[l,i]=(0,t.useState)((()=>function(e){let{defaultValue:r,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(r){if(!h({value:r,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${r}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return r}const t=n.find((e=>e.default))??n[0];if(!t)throw new Error("Unexpected error: 0 tabValues");return t.value}({defaultValue:r,tabValues:a}))),[o,d]=x({queryString:n,groupId:s}),[m,f]=function(e){let{groupId:r}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(r),[s,a]=(0,u.Dv)(n);return[s,(0,t.useCallback)((e=>{n&&a.set(e)}),[n,a])]}({groupId:s}),b=(()=>{const e=o??m;return h({value:e,tabValues:a})?e:null})();(0,c.A)((()=>{b&&i(b)}),[b]);return{selectedValue:l,selectValue:(0,t.useCallback)((e=>{if(!h({value:e,tabValues:a}))throw new Error(`Can't select invalid tab value=${e}`);i(e),d(e),f(e)}),[d,f,a]),tabValues:a}}var f=n(3947);const b={tabList:"tabList_y5wR",tabItem:"tabItem_yOg4"};var j=n(6106);function v(e){let{className:r,block:n,selectedValue:t,selectValue:l,tabValues:c}=e;const i=[],{blockElementScrollPositionUntilNextRender:o}=(0,a.a_)(),u=e=>{const r=e.currentTarget,n=i.indexOf(r),s=c[n].value;s!==t&&(o(r),l(s))},d=e=>{let r=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const n=i.indexOf(e.currentTarget)+1;r=i[n]??i[0];break}case"ArrowLeft":{const n=i.indexOf(e.currentTarget)-1;r=i[n]??i[i.length-1];break}}r?.focus()};return(0,j.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,s.A)("tabs",{"tabs--block":n},r),children:c.map((e=>{let{value:r,label:n,attributes:a}=e;return(0,j.jsx)("li",{role:"tab",tabIndex:t===r?0:-1,"aria-selected":t===r,ref:e=>i.push(e),onKeyDown:d,onClick:u,...a,className:(0,s.A)("tabs__item",b.tabItem,a?.className,{"tabs__item--active":t===r}),children:n??r},r)}))})}function g(e){let{lazy:r,children:n,selectedValue:a}=e;const l=(Array.isArray(n)?n:[n]).filter(Boolean);if(r){const e=l.find((e=>e.props.value===a));return e?(0,t.cloneElement)(e,{className:(0,s.A)("margin-top--md",e.props.className)}):null}return(0,j.jsx)("div",{className:"margin-top--md",children:l.map(((e,r)=>(0,t.cloneElement)(e,{key:r,hidden:e.props.value!==a})))})}function w(e){const r=m(e);return(0,j.jsxs)("div",{className:(0,s.A)("tabs-container",b.tabList),children:[(0,j.jsx)(v,{...r,...e}),(0,j.jsx)(g,{...r,...e})]})}function k(e){const r=(0,f.A)();return(0,j.jsx)(w,{...e,children:d(e.children)},String(r))}},2036:(e,r,n)=>{n.d(r,{R:()=>l,x:()=>c});var t=n(7378);const s={},a=t.createContext(s);function l(e){const r=t.useContext(a);return t.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function c(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:l(e.components),t.createElement(a.Provider,{value:r},e.children)}}}]);