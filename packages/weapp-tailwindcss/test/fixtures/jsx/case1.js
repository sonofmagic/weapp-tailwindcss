(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/index/index"],{

  /***/ "./node_modules/babel-loader/lib/index.js!./src/pages/index/index.tsx":
  /*!*******************************************************************!*\
    !*** ./node_modules/babel-loader/lib!./src/pages/index/index.tsx ***!
    \*******************************************************************/
  /*! exports provided: default */
  /*! exports used: default */
  /***/ (function(module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  /* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
  /* harmony import */ var _index_module_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.module.scss */ "./src/pages/index/index.module.scss");
  /* harmony import */ var _index_module_scss__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_index_module_scss__WEBPACK_IMPORTED_MODULE_1__);
  /* harmony import */ var _index_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.scss */ "./src/pages/index/index.scss");
  /* harmony import */ var _index_scss__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_index_scss__WEBPACK_IMPORTED_MODULE_2__);
  /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");
  /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);
  // import { useCallback } from "react";
   // import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";
  
  
  
  
  
  var Index = function Index() {
    return /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__[/* View */ "a"], {
      className: "text-[100px] font-bold underline ".concat(_index_module_scss__WEBPACK_IMPORTED_MODULE_1___default.a['xxx']),
      children: "123"
    });
  };
  
  /* harmony default export */ __webpack_exports__["a"] = (Index);
  
  /***/ }),
  
  /***/ "./node_modules/react/cjs/react-jsx-runtime.production.min.js":
  /*!********************************************************************!*\
    !*** ./node_modules/react/cjs/react-jsx-runtime.production.min.js ***!
    \********************************************************************/
  /*! no static exports found */
  /*! exports used: jsx */
  /***/ (function(module, exports, __webpack_require__) {
  
  "use strict";
  /** @license React v17.0.2
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  
  
  __webpack_require__(/*! object-assign */ "./node_modules/object-assign/index.js");
  
  var f = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js"),
      g = 60103;
  
  exports.Fragment = 60107;
  
  if ("function" === typeof Symbol && Symbol.for) {
    var h = Symbol.for;
    g = h("react.element");
    exports.Fragment = h("react.fragment");
  }
  
  var m = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
      n = Object.prototype.hasOwnProperty,
      p = {
    key: !0,
    ref: !0,
    __self: !0,
    __source: !0
  };
  
  function q(c, a, k) {
    var b,
        d = {},
        e = null,
        l = null;
    void 0 !== k && (e = "" + k);
    void 0 !== a.key && (e = "" + a.key);
    void 0 !== a.ref && (l = a.ref);
  
    for (b in a) {
      n.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
    }
  
    if (c && c.defaultProps) for (b in a = c.defaultProps, a) {
      void 0 === d[b] && (d[b] = a[b]);
    }
    return {
      $$typeof: g,
      type: c,
      key: e,
      ref: l,
      props: d,
      _owner: m.current
    };
  }
  
  exports.jsx = q;
  exports.jsxs = q;
  
  /***/ }),
  
  /***/ "./src/pages/index/index.module.scss":
  /*!*******************************************!*\
    !*** ./src/pages/index/index.module.scss ***!
    \*******************************************/
  /*! no static exports found */
  /*! exports used: default */
  /***/ (function(module, exports, __webpack_require__) {
  
  // extracted by mini-css-extract-plugin
  
  /***/ }),
  
  /***/ "./src/pages/index/index.scss":
  /*!************************************!*\
    !*** ./src/pages/index/index.scss ***!
    \************************************/
  /*! no static exports found */
  /***/ (function(module, exports, __webpack_require__) {
  
  // extracted by mini-css-extract-plugin
  
  /***/ }),
  
  /***/ "./src/pages/index/index.tsx":
  /*!***********************************!*\
    !*** ./src/pages/index/index.tsx ***!
    \***********************************/
  /*! no exports provided */
  /*! all exports used */
  /***/ (function(module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/runtime.esm.js");
  /* harmony import */ var _node_modules_babel_loader_lib_index_js_index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/babel-loader/lib!./index.tsx */ "./node_modules/babel-loader/lib/index.js!./src/pages/index/index.tsx");
  
  
  var config = {"navigationBarTitleText":"Taro-hooks","enableShareAppMessage":true};
  
  _node_modules_babel_loader_lib_index_js_index_tsx__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].enableShareAppMessage = true
  var inst = Page(Object(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__["createPageConfig"])(_node_modules_babel_loader_lib_index_js_index_tsx__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"], 'pages/index/index', {root:{cn:[]}}, config || {}))
  
  
  
  
  /***/ })
  
  },[["./src/pages/index/index.tsx","runtime","taro","vendors"]]]);
  //# sourceMappingURL=index.js.map