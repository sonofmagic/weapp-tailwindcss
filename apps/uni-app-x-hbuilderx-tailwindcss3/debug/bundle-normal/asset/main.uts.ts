import '/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite/node_modules/@dcloudio/uni-console/src/runtime/app/index.ts';import App from './App.uvue'

import { createSSRApp } from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
export function main(app: IApp) {
    definePageRoutes();
    defineAppConfig();
    (createApp()['app'] as VueApp).mount(app, GenUniApp());
}

export class UniAppConfig extends io.dcloud.uniapp.appframe.AppConfig {
    override name: string = "aaa"
    override appid: string = ""
    override versionName: string = "1.0.0"
    override versionCode: string = "100"
    override uniCompilerVersion: string = "4.75"
    
    constructor() { super() }
}

import GenPagesIndexIndexClass from './pages/index/index.uvue'
function definePageRoutes() {
__uniRoutes.push({ path: "pages/index/index", component: GenPagesIndexIndexClass, meta: { isQuit: true } as UniPageMeta, style: _uM([["navigationBarTitleText","uni-app x"]]) } as UniPageRoute)
}
const __uniTabBar: Map<string, any | null> | null = null
const __uniLaunchPage: Map<string, any | null> = _uM([["url","pages/index/index"],["style",_uM([["navigationBarTitleText","uni-app x"]])]])
function defineAppConfig(){
  __uniConfig.entryPagePath = '/pages/index/index'
  __uniConfig.globalStyle = _uM([["navigationBarTextStyle","black"],["navigationBarTitleText","uni-app x"],["navigationBarBackgroundColor","#F8F8F8"],["backgroundColor","#F8F8F8"]])
  __uniConfig.getTabBarConfig = ():Map<string, any> | null =>  null
  __uniConfig.tabBar = __uniConfig.getTabBarConfig()
  __uniConfig.conditionUrl = ''
  __uniConfig.uniIdRouter = _uM()
  
  __uniConfig.ready = true
}
