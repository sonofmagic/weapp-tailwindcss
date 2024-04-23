(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/debug/index"],{

  /***/ "./node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib/index.js!./src/pages/debug/index.tsx":
  /*!****************************************************************************************************!*\
    !*** ./node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib!./src/pages/debug/index.tsx ***!
    \****************************************************************************************************/
  /*! exports provided: default */
  /*! exports used: default */
  /***/ (function(module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js");
  /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
  
  
  var Index = function Index() {
    var text = 'debugger';
    Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(function () {
      console.log('text has change or init');
      debugger;
    }, [text]); // 此处写可以准确触发
    // debugger
  
    return text;
  };
  
  /* harmony default export */ __webpack_exports__["a"] = (Index);
  
  /***/ }),
  
  /***/ "./src/pages/debug/index.tsx":
  /*!***********************************!*\
    !*** ./src/pages/debug/index.tsx ***!
    \***********************************/
  /*! no exports provided */
  /*! all exports used */
  /***/ (function(module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/runtime.esm.js");
  /* harmony import */ var _node_modules_tarojs_mini_runner_node_modules_babel_loader_lib_index_js_index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib!./index.tsx */ "./node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib/index.js!./src/pages/debug/index.tsx");
  
  
  var config = {"navigationBarTitleText":"Debugger","enableShareAppMessage":true};
  
  _node_modules_tarojs_mini_runner_node_modules_babel_loader_lib_index_js_index_tsx__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].enableShareAppMessage = true
  var inst = Page(Object(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__["createPageConfig"])(_node_modules_tarojs_mini_runner_node_modules_babel_loader_lib_index_js_index_tsx__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"], 'pages/debug/index', {root:{cn:[]}}, config || {}))
  
  
  
  
  /***/ })
  
  },[["./src/pages/debug/index.tsx","runtime","taro","vendors"]]]);
  //# sourceMappingURL=index.js.map