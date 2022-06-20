;(wx['webpackJsonp'] = wx['webpackJsonp'] || []).push([
  ['pages/index/index'],
  {
    /***/ './node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/dist/index.js?!./src/pages/index/index.vue?vue&type=script&lang=ts&setup=true':
      /*!*********************************************************************************************************************************************************************************!*\
    !*** ./node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib!./node_modules/vue-loader/dist??ref--10-0!./src/pages/index/index.vue?vue&type=script&lang=ts&setup=true ***!
    \*********************************************************************************************************************************************************************************/
      /*! exports provided: default */
      /*! exports used: default */
      /***/ function (module, __webpack_exports__, __webpack_require__) {
        'use strict'
        /* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ './node_modules/vue/dist/vue.runtime.esm-bundler.js')
        /* harmony import */ var _index_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.scss */ './src/pages/index/index.scss')
        /* harmony import */ var _index_scss__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/ __webpack_require__.n(_index_scss__WEBPACK_IMPORTED_MODULE_1__)

        /* harmony default export */ __webpack_exports__['a'] = /*#__PURE__*/ Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* defineComponent */ 'f'])({
          __name: 'index',
          setup: function setup(__props, _ref) {
            var expose = _ref.expose
            expose()
            var msg = Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* ref */ 'm'])('Hello world!')
            var flag = Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* ref */ 'm'])(true)
            var __returned__ = {
              msg: msg,
              flag: flag
            }
            Object.defineProperty(__returned__, '__isScriptSetup', {
              enumerable: false,
              value: true
            })
            return __returned__
          }
        })

        /***/
      },

    /***/ './node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/dist/templateLoader.js?!./node_modules/vue-loader/dist/index.js?!./src/pages/index/index.vue?vue&type=template&id=1badc801&ts=true':
      /*!*********************************************************************************************************************************************************************************************************************************************!*\
    !*** ./node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib!./node_modules/vue-loader/dist/templateLoader.js??ref--6!./node_modules/vue-loader/dist??ref--10-0!./src/pages/index/index.vue?vue&type=template&id=1badc801&ts=true ***!
    \*********************************************************************************************************************************************************************************************************************************************/
      /*! exports provided: render */
      /*! exports used: render */
      /***/ function (module, __webpack_exports__, __webpack_require__) {
        'use strict'
        /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'a', function () {
          return render
        })
        /* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ './node_modules/vue/dist/vue.runtime.esm-bundler.js')

        var _hoisted_1 = /*#__PURE__*/ Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* createElementVNode */ 'd'])(
          'view',
          {
            class: 'bg-gray-100 dark:bg-zinc-800 h-10 w-10',
            'data-id': 'bg-[#654123] dark:bg-[#abcdef]',
            'hover-class': 'bg-red-500 dark:bg-[#487512]'
          },
          null,
          -1
          /* HOISTED */
        )

        var _hoisted_2 = /*#__PURE__*/ Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* createStaticVNode */ 'e'])(
          '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view><view class="w-32 py-2 rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300"> Default </view></view><view class="test">test</view>',
          3
        )

        function render(_ctx, _cache, $props, $setup, $data, $options) {
          return (
            Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* openBlock */ 'k'])(),
            Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* createElementBlock */ 'c'])(
              'view',
              {
                class: Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* normalizeClass */ 'i'])(['index container bg-[#ffffff]', $setup.flag ? 'text-[#aaaaaa]' : 'text-[#fafafa]'])
              },
              [
                _hoisted_1,
                Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* createCommentVNode */ 'b'])(' <template>1</template> '),
                Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* createElementVNode */ 'd'])(
                  'view',
                  {
                    class: Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* normalizeClass */ 'i'])([$setup.flag ? 'bg-red-900' : 'bg-[#fafa00]'])
                  },
                  'bg-[#fafa00]',
                  2
                  /* CLASS */
                ),
                Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* createElementVNode */ 'd'])(
                  'view',
                  {
                    class: Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* normalizeClass */ 'i'])({
                      'bg-[#098765]': $setup.flag === true
                    })
                  },
                  'bg-[#098765]',
                  2
                  /* CLASS */
                ),
                _hoisted_2
              ],
              2
              /* CLASS */
            )
          )
        }

        /***/
      },

    /***/ './node_modules/@tarojs/taro-loader/lib/raw.js!./src/pages/index/index.vue':
      /*!*********************************************************************************!*\
    !*** ./node_modules/@tarojs/taro-loader/lib/raw.js!./src/pages/index/index.vue ***!
    \*********************************************************************************/
      /*! exports provided: default */
      /*! exports used: default */
      /***/ function (module, __webpack_exports__, __webpack_require__) {
        'use strict'
        /* harmony import */ var _index_vue_vue_type_template_id_1badc801_ts_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! ./index.vue?vue&type=template&id=1badc801&ts=true */ './src/pages/index/index.vue?vue&type=template&id=1badc801&ts=true'
        )
        /* harmony import */ var _index_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          /*! ./index.vue?vue&type=script&lang=ts&setup=true */ './src/pages/index/index.vue?vue&type=script&lang=ts&setup=true'
        )
        /* harmony import */ var G_github2_weapp_tailwindcss_webpack_plugin_demo_taro_vue3_app_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_2__ =
          __webpack_require__(/*! ./node_modules/vue-loader/dist/exportHelper.js */ './node_modules/vue-loader/dist/exportHelper.js')
        /* harmony import */ var G_github2_weapp_tailwindcss_webpack_plugin_demo_taro_vue3_app_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_2___default =
          /*#__PURE__*/ __webpack_require__.n(
            G_github2_weapp_tailwindcss_webpack_plugin_demo_taro_vue3_app_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_2__
          )

        const __exports__ =
          /*#__PURE__*/ G_github2_weapp_tailwindcss_webpack_plugin_demo_taro_vue3_app_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_2___default()(
            _index_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_1__[/* default */ 'a'],
            [
              ['render', _index_vue_vue_type_template_id_1badc801_ts_true__WEBPACK_IMPORTED_MODULE_0__[/* render */ 'a']],
              ['__file', 'src/pages/index/index.vue']
            ]
          )
        /* hot reload */
        if (false) {
        }

        /* harmony default export */ __webpack_exports__['a'] = __exports__

        /***/
      },

    /***/ './src/pages/index/index.scss':
      /*!************************************!*\
    !*** ./src/pages/index/index.scss ***!
    \************************************/
      /*! no static exports found */
      /***/ function (module, exports, __webpack_require__) {
        // extracted by mini-css-extract-plugin
        /***/
      },

    /***/ './src/pages/index/index.vue':
      /*!***********************************!*\
    !*** ./src/pages/index/index.vue ***!
    \***********************************/
      /*! no exports provided */
      /*! all exports used */
      /***/ function (module, __webpack_exports__, __webpack_require__) {
        'use strict'
        __webpack_require__.r(__webpack_exports__)
        /* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ './node_modules/@tarojs/runtime/dist/runtime.esm.js')
        /* harmony import */ var _node_modules_tarojs_taro_loader_lib_raw_js_index_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          /*! ../../../node_modules/@tarojs/taro-loader/lib/raw.js!./index.vue */ './node_modules/@tarojs/taro-loader/lib/raw.js!./src/pages/index/index.vue'
        )

        var config = { navigationBarTitleText: '首页' }

        var inst = Page(
          Object(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__['createPageConfig'])(
            _node_modules_tarojs_taro_loader_lib_raw_js_index_vue__WEBPACK_IMPORTED_MODULE_1__[/* default */ 'a'],
            'pages/index/index',
            { root: { cn: [] } },
            config || {}
          )
        )

        /***/
      },

    /***/ './src/pages/index/index.vue?vue&type=script&lang=ts&setup=true':
      /*!**********************************************************************!*\
    !*** ./src/pages/index/index.vue?vue&type=script&lang=ts&setup=true ***!
    \**********************************************************************/
      /*! exports provided: default */
      /*! exports used: default */
      /***/ function (module, __webpack_exports__, __webpack_require__) {
        'use strict'
        /* harmony import */ var _node_modules_tarojs_mini_runner_node_modules_babel_loader_lib_index_js_node_modules_vue_loader_dist_index_js_ref_10_0_index_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_0__ =
          __webpack_require__(
            /*! -!../../../node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib!../../../node_modules/vue-loader/dist??ref--10-0!./index.vue?vue&type=script&lang=ts&setup=true */ './node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/dist/index.js?!./src/pages/index/index.vue?vue&type=script&lang=ts&setup=true'
          )
        /* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, 'a', function () {
          return _node_modules_tarojs_mini_runner_node_modules_babel_loader_lib_index_js_node_modules_vue_loader_dist_index_js_ref_10_0_index_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_0__[
            'a'
          ]
        })

        /***/
      },

    /***/ './src/pages/index/index.vue?vue&type=template&id=1badc801&ts=true':
      /*!*************************************************************************!*\
    !*** ./src/pages/index/index.vue?vue&type=template&id=1badc801&ts=true ***!
    \*************************************************************************/
      /*! exports provided: render */
      /*! exports used: render */
      /***/ function (module, __webpack_exports__, __webpack_require__) {
        'use strict'
        /* harmony import */ var _node_modules_tarojs_mini_runner_node_modules_babel_loader_lib_index_js_node_modules_vue_loader_dist_templateLoader_js_ref_6_node_modules_vue_loader_dist_index_js_ref_10_0_index_vue_vue_type_template_id_1badc801_ts_true__WEBPACK_IMPORTED_MODULE_0__ =
          __webpack_require__(
            /*! -!../../../node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib!../../../node_modules/vue-loader/dist/templateLoader.js??ref--6!../../../node_modules/vue-loader/dist??ref--10-0!./index.vue?vue&type=template&id=1badc801&ts=true */ './node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/dist/templateLoader.js?!./node_modules/vue-loader/dist/index.js?!./src/pages/index/index.vue?vue&type=template&id=1badc801&ts=true'
          )
        /* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, 'a', function () {
          return _node_modules_tarojs_mini_runner_node_modules_babel_loader_lib_index_js_node_modules_vue_loader_dist_templateLoader_js_ref_6_node_modules_vue_loader_dist_index_js_ref_10_0_index_vue_vue_type_template_id_1badc801_ts_true__WEBPACK_IMPORTED_MODULE_0__[
            'a'
          ]
        })

        /***/
      }
  },
  [['./src/pages/index/index.vue', 'runtime', 'taro', 'vendors']]
])
//# sourceMappingURL=index.js.map
