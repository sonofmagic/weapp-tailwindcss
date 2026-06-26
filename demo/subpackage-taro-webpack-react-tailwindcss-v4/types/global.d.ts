/// <reference types="@tarojs/taro" />

declare module '*.css';

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    TARO_ENV: 'weapp' | 'alipay' | 'h5' | 'rn' | 'tt'
  }
}
