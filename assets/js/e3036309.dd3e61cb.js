"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[6733],{7942:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>k});var a=n(959);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function p(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?p(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):p(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},p=Object.keys(e);for(a=0;a<p.length;a++)n=p[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(a=0;a<p.length;a++)n=p[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=a.createContext({}),o=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},c=function(e){var t=o(e.components);return a.createElement(l.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,p=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),m=o(n),d=i,k=m["".concat(l,".").concat(d)]||m[d]||u[d]||p;return n?a.createElement(k,r(r({ref:t},c),{},{components:n})):a.createElement(k,r({ref:t},c))}));function k(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var p=n.length,r=new Array(p);r[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[m]="string"==typeof e?e:i,r[1]=s;for(var o=2;o<p;o++)r[o]=n[o];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},6531:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>r,default:()=>u,frontMatter:()=>p,metadata:()=>s,toc:()=>o});var a=n(8028),i=(n(959),n(7942));const p={},r="\u539f\u751f\u5f00\u53d1(webpack5/gulp)",s={unversionedId:"quick-start/frameworks/native",id:"quick-start/frameworks/native",title:"\u539f\u751f\u5f00\u53d1(webpack5/gulp)",description:"\u8fd9\u5757\u5efa\u8bae\u76f4\u63a5\u4f7f\u7528\u4e0b\u65b9\u914d\u7f6e\u597d\u7684\u539f\u751f\u5c0f\u7a0b\u5e8f\u5f00\u53d1\u6a21\u677f",source:"@site/docs/quick-start/frameworks/native.md",sourceDirName:"quick-start/frameworks",slug:"/quick-start/frameworks/native",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/native",draft:!1,editUrl:"https://github.com/sonofmagic/weapp-tailwindcss/tree/dev/website/docs/quick-start/frameworks/native.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"mpx (\u539f\u751f\u589e\u5f3a)",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/mpx"},next:{title:"hbuilderx \u4f7f\u7528\u65b9\u5f0f",permalink:"/weapp-tailwindcss/docs/quick-start/frameworks/hbuilderx"}},l={},o=[{value:"webpack5",id:"webpack5",level:2},{value:"gulp",id:"gulp",level:2},{value:"vscode tailwindcss \u667a\u80fd\u63d0\u793a\u8bbe\u7f6e",id:"vscode-tailwindcss-\u667a\u80fd\u63d0\u793a\u8bbe\u7f6e",level:2}],c={toc:o},m="wrapper";function u(e){let{components:t,...p}=e;return(0,i.kt)(m,(0,a.Z)({},c,p,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"\u539f\u751f\u5f00\u53d1webpack5gulp"},"\u539f\u751f\u5f00\u53d1(webpack5/gulp)"),(0,i.kt)("admonition",{type:"tip"},(0,i.kt)("h4",{parentName:"admonition",id:"\u8fd9\u5757\u5efa\u8bae\u76f4\u63a5\u4f7f\u7528\u4e0b\u65b9\u914d\u7f6e\u597d\u7684\u539f\u751f\u5c0f\u7a0b\u5e8f\u5f00\u53d1\u6a21\u677f"},"\u8fd9\u5757\u5efa\u8bae\u76f4\u63a5\u4f7f\u7528\u4e0b\u65b9\u914d\u7f6e\u597d\u7684\u539f\u751f\u5c0f\u7a0b\u5e8f\u5f00\u53d1\u6a21\u677f"),(0,i.kt)("p",{parentName:"admonition"},(0,i.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/weapp-native-mina-tailwindcss-template"},"weapp-native-mina-tailwindcss-template(webpack\u6253\u5305)")),(0,i.kt)("p",{parentName:"admonition"},(0,i.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo/gulp-app"},"weapp-tailwindcss-gulp-template(gulp\u6253\u5305)")),(0,i.kt)("p",{parentName:"admonition"},"\u7ed9\u539f\u751f\u5c0f\u7a0b\u5e8f\u52a0\u5165\u7f16\u8bd1\u65f6\u8fd9\u5757 ",(0,i.kt)("inlineCode",{parentName:"p"},"webpack/vite/gulp")," \u7b49\u7b49\u5de5\u5177\uff0c\u601d\u8def\u90fd\u662f\u4e00\u6837\u7684\uff0c\u7136\u800c\u5b9e\u73b0\u8d77\u6765\u6bd4\u8f83\u590d\u6742\u635f\u8017\u7cbe\u529b\uff0c\u5728\u6b64\u4e0d\u63d0\u53ca\u539f\u7406\u3002")),(0,i.kt)("h2",{id:"webpack5"},"webpack5"),(0,i.kt)("p",null,"\u76f4\u63a5\u5728 ",(0,i.kt)("inlineCode",{parentName:"p"},"webpack.config.js")," \u6ce8\u518c\u5373\u53ef"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"// webpack.config.js\n  plugins: [\n    new UnifiedWebpackPluginV5({\n      appType: 'native',\n    }),\n  ],\n")),(0,i.kt)("p",null,"\u5177\u4f53\u53ef\u4ee5\u53c2\u8003 ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/native-mina"},"native-mina\u65b9\u6848"),"\u3002"),(0,i.kt)("h2",{id:"gulp"},"gulp"),(0,i.kt)("p",null,"\u8fd9\u4e2a\u914d\u7f6e\u7a0d\u5fae\u7e41\u7410\u4e00\u4e9b"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"// gulpfile.js\n\nconst { createPlugins } = require('weapp-tailwindcss-webpack-plugin/gulp')\n// \u5728 gulp \u91cc\u4f7f\u7528\uff0c\u5148\u4f7f\u7528 postcss \u8f6c\u5316 css\uff0c\u89e6\u53d1 tailwindcss \u8fd0\u884c\uff0c\u8f6c\u5316 transformWxss\uff0c\u7136\u540e\u518d transformJs, transformWxml\n// createPlugins \u53c2\u6570 options \u5c31\u662f\u672c\u63d2\u4ef6\u7684\u914d\u7f6e\u9879\nconst { transformJs, transformWxml, transformWxss } = createPlugins()\n\n// \u53c2\u8003\u987a\u5e8f\n// transformWxss\nfunction sassCompile() {\n  return gulp\n    .src(paths.src.scssFiles)\n    .pipe(sass({ errLogToConsole: true, outputStyle: 'expanded' }).on('error', sass.logError))\n    .pipe(postcss())\n    .pipe(transformWxss())\n    .pipe(\n      rename({\n        extname: '.wxss'\n      })\n    )\n    .pipe(replace('.scss', '.wxss'))\n    .pipe(gulp.dest(paths.dist.baseDir))\n}\n// transformJs\nfunction compileTsFiles() {\n  return gulp.src(paths.src.jsFiles, {}).pipe(plumber()).pipe(tsProject()).pipe(transformJs()).pipe(gulp.dest(paths.dist.baseDir))\n}\n\n// transformWxml\nfunction copyWXML() {\n  return gulp.src(paths.src.wxmlFiles, {}).pipe(transformWxml()).pipe(gulp.dest(paths.dist.baseDir))\n}\n\n// \u6ce8\u610f sassCompile \u5728 copyWXML \u548c compileTsFiles\uff0c  \u8fd9\u662f\u4e3a\u4e86\u5148\u89e6\u53d1 tailwindcss \u5904\u7406\uff0c\u4ece\u800c\u5728\u8fd0\u884c\u65f6\u83b7\u53d6\u5230\u4e0a\u4e0b\u6587\nconst buildTasks = [cleanTmp, copyBasicFiles, sassCompile, copyWXML, compileTsFiles]\n// \u6ce8\u518c\u9ed8\u8ba4\u4efb\u52a1 (\u4e32\u884c)\ngulp.task('default', gulp.series(buildTasks))\n")),(0,i.kt)("p",null,"\u5177\u4f53\u53ef\u4ee5\u53c2\u8003 ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/gulp-app"},"weapp-tailwindcss-gulp-template(gulp\u6253\u5305)")," \u6a21\u677f\u9879\u76ee\u7684\u914d\u7f6e\u3002"),(0,i.kt)("admonition",{type:"tip"},(0,i.kt)("p",{parentName:"admonition"},"\u53d1\u73b0\u5f88\u591a\u7528\u6237\uff0c\u5728\u4f7f\u7528\u539f\u751f\u5f00\u53d1\u7684\u65f6\u5019\uff0c\u7ecf\u5e38\u4f1a\u95ee\uff0c\u4e3a\u4ec0\u4e48\u6837\u5f0f\u4e0d\u751f\u6548\u3002"),(0,i.kt)("p",{parentName:"admonition"},"\u8fd9\u53ef\u80fd\u6709\u4ee5\u4e0b\u51e0\u4e2a\u539f\u56e0:"),(0,i.kt)("ol",{parentName:"admonition"},(0,i.kt)("li",{parentName:"ol"},"\u4ee3\u7801\u6587\u4ef6\u4e0d\u5728 ",(0,i.kt)("inlineCode",{parentName:"li"},"tailwind.config.js")," \u7684 ",(0,i.kt)("inlineCode",{parentName:"li"},"content")," \u914d\u7f6e\u5185"),(0,i.kt)("li",{parentName:"ol"},"\u539f\u751f\u5c0f\u7a0b\u5e8f\u7ec4\u4ef6\u662f\u9ed8\u8ba4\u5f00\u542f ",(0,i.kt)("strong",{parentName:"li"},"\u7ec4\u4ef6\u6837\u5f0f\u9694\u79bb")," \u7684\uff0c\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0c\u81ea\u5b9a\u4e49\u7ec4\u4ef6\u7684\u6837\u5f0f\u53ea\u53d7\u5230\u81ea\u5b9a\u4e49\u7ec4\u4ef6 wxss \u7684\u5f71\u54cd\u3002\u800c ",(0,i.kt)("inlineCode",{parentName:"li"},"tailwindcss")," \u751f\u6210\u7684\u5de5\u5177\u7c7b\uff0c\u90fd\u5728 ",(0,i.kt)("inlineCode",{parentName:"li"},"app.wxss")," \u8fd9\u4e2a\u5168\u5c40\u6837\u5f0f\u6587\u4ef6\u91cc\u9762\u3002\u4e0d\u5c5e\u4e8e\u7ec4\u4ef6\u5185\u90e8\uff0c\u81ea\u7136\u4e0d\u751f\u6548\u3002")),(0,i.kt)("p",{parentName:"admonition"},"\u8fd9\u65f6\u5019\u53ef\u4ee5\u4f7f\u7528:"),(0,i.kt)("pre",{parentName:"admonition"},(0,i.kt)("code",{parentName:"pre",className:"language-js"},"/* \u7ec4\u4ef6 custom-component.js */\nComponent({\n  options: {\n    addGlobalClass: true,\n  }\n})\n")),(0,i.kt)("p",{parentName:"admonition"},"\u6765\u8ba9\u7ec4\u4ef6\u5e94\u7528\u5230 ",(0,i.kt)("inlineCode",{parentName:"p"},"app.wxss")," \u91cc\u7684\u6837\u5f0f\u3002"),(0,i.kt)("p",{parentName:"admonition"},(0,i.kt)("a",{parentName:"p",href:"https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html#%E7%BB%84%E4%BB%B6%E6%A0%B7%E5%BC%8F%E9%9A%94%E7%A6%BB"},"\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u76f8\u5173\u5f00\u53d1\u6587\u6863"))),(0,i.kt)("h2",{id:"vscode-tailwindcss-\u667a\u80fd\u63d0\u793a\u8bbe\u7f6e"},"vscode tailwindcss \u667a\u80fd\u63d0\u793a\u8bbe\u7f6e"),(0,i.kt)("p",null,"\u6211\u4eec\u77e5\u9053 ",(0,i.kt)("inlineCode",{parentName:"p"},"tailwindcss")," \u6700\u4f73\u5b9e\u8df5\uff0c\u662f\u8981\u7ed3\u5408 ",(0,i.kt)("inlineCode",{parentName:"p"},"vscode"),"/",(0,i.kt)("inlineCode",{parentName:"p"},"webstorm"),"\u63d0\u793a\u63d2\u4ef6\u4e00\u8d77\u4f7f\u7528\u7684\u3002"),(0,i.kt)("p",null,"\u5047\u5982\u4f60\u9047\u5230\u4e86\uff0c\u5728 ",(0,i.kt)("inlineCode",{parentName:"p"},"vscode")," \u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"wxml")," \u6587\u4ef6\u4e2d\uff0c\u7f16\u5199 ",(0,i.kt)("inlineCode",{parentName:"p"},"class")," \u6ca1\u6709\u51fa\u667a\u80fd\u63d0\u793a\u7684\u60c5\u51b5\uff0c\u53ef\u4ee5\u53c2\u8003\u4ee5\u4e0b\u6b65\u9aa4\u3002"),(0,i.kt)("p",null,"\u8fd9\u91cc\u6211\u4eec\u4ee5 ",(0,i.kt)("inlineCode",{parentName:"p"},"vscode")," \u4e3a\u4f8b:"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("p",{parentName:"li"},"\u5b89\u88c5 ",(0,i.kt)("a",{parentName:"p",href:"https://marketplace.visualstudio.com/items?itemName=qiu8310.minapp-vscode"},(0,i.kt)("inlineCode",{parentName:"a"},"WXML - Language Services \u63d2\u4ef6")),"(\u4e00\u641c wxml \u4e0b\u8f7d\u91cf\u6700\u591a\u7684\u5c31\u662f\u4e86)")),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("p",{parentName:"li"},"\u5b89\u88c5 ",(0,i.kt)("a",{parentName:"p",href:"https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss"},(0,i.kt)("inlineCode",{parentName:"a"},"Tailwind CSS IntelliSense \u63d2\u4ef6"))))),(0,i.kt)("p",null,"\u63a5\u7740\u627e\u5230 ",(0,i.kt)("inlineCode",{parentName:"p"},"Tailwind CSS IntelliSense")," \u7684 ",(0,i.kt)("inlineCode",{parentName:"p"},"\u6269\u5c55\u8bbe\u7f6e")),(0,i.kt)("p",null,"\u5728 ",(0,i.kt)("inlineCode",{parentName:"p"},"include languages"),",\u624b\u52a8\u6807\u8bb0 ",(0,i.kt)("inlineCode",{parentName:"p"},"wxml")," \u7684\u7c7b\u578b\u4e3a ",(0,i.kt)("inlineCode",{parentName:"p"},"html")),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"\u5982\u56fe\u6240\u793a",src:n(8378).Z,width:"981",height:"518"})),(0,i.kt)("p",null,"\u667a\u80fd\u63d0\u793a\u5c31\u51fa\u6765\u4e86:"),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"\u667a\u80fd\u63d0\u793a",src:n(3242).Z,width:"427",height:"265"})))}u.isMDXComponent=!0},8378:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/vscode-setting-1d92abd9177ac2070958503b101947f1.png"},3242:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/wxml-i-b89bf7066b243324a723612e36d17681.png"}}]);