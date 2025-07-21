
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
const GenAppStyles = [_uM([["mt-_32d43rpx_", _pS(_uM([["marginTop", "32.43rpx"]]))], ["bg-_h322323_", _pS(_uM([["--tw-bg-opacity", "1"], ["backgroundColor", "rgba(50,35,35,1)"]]))], ["px-4", _pS(_uM([["paddingLeft", "32rpx"], ["paddingRight", "32rpx"]]))], ["text-_h258f27_", _pS(_uM([["--tw-text-opacity", "1"], ["color", "rgba(37,143,39,1)"]]))]])]
