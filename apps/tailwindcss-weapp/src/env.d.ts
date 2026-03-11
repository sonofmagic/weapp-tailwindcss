/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line ts/no-explicit-any, ts/no-empty-object-type
  const component: DefineComponent<{}, {}, any>
  export default component
}
