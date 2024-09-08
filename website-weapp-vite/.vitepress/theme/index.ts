// .vitepress/theme/index.ts
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import Theme from 'vitepress/theme'
import type { EnhanceAppContext } from 'vitepress'
import '@shikijs/vitepress-twoslash/style.css'
import './index.scss'

export default {
  extends: Theme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue)
  },
}
