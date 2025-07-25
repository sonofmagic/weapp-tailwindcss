
	let firstBackTime = 0
	const __sfc__ = defineApp({
		onLaunch: function () {
			console.log('App Launch', " at App.uvue:5")
		},
		onShow: function () {
			console.log('App Show', " at App.uvue:8")
		},
		onHide: function () {
			console.log('App Hide', " at App.uvue:11")
		},

		onLastPageBackPress: function () {
			console.log('App LastPageBackPress', " at App.uvue:15")
			if (firstBackTime == 0) {
				uni.showToast({
					title: '再按一次退出应用',
					position: 'bottom',
				})
				firstBackTime = Date.now()
				setTimeout(() => {
					firstBackTime = 0
				}, 2000)
			} else if (Date.now() - firstBackTime < 2000) {
				firstBackTime = Date.now()
				uni.exit()
			}
		},

		onExit: function () {
			console.log('App Exit', " at App.uvue:32")
		},
	})

export default __sfc__
const GenAppStyles = [_uM([["mt-_32d43rpx_", _pS(_uM([["marginTop", "32.43rpx"]]))], ["mt-_100px_", _pS(_uM([["marginTop", 100]]))], ["bg-_red_", _pS(_uM([["backgroundColor", "#FF0000"]]))], ["text-_90px_", _pS(_uM([["fontSize", 90]]))], ["text-_100px_", _pS(_uM([["fontSize", 100]]))], ["text-_h844343_", _pS(_uM([["color", "#844343"]]))]])]
