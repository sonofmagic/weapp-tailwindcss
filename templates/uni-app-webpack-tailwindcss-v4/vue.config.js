const { WeappTailwindcss } = require('weapp-tailwindcss/webpack')
const path = require('path')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
    // some option...
    configureWebpack: (config) => {
        config.plugins.push(
            new WeappTailwindcss({
                rem2rpx: true,
                cssEntries: [
                    path.resolve(__dirname, 'src/main.css')
                ]
            })
        )
    }
    // other option...
}

module.exports = config
