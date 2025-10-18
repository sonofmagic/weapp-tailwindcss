// Error: ENOENT: no such file or directory, open 'D:\HBuilderX\plugins\uniapp-cli\tailwind.config.js'

const path = require("path");
const {
	WeappTailwindcssDisabled,
	isWeapp
} = require("./platform");

module.exports = {
	plugins: [
		require("postcss-import")({
			resolve(id, basedir, importOptions) {
				if (id.startsWith("~@/")) {
					return path.resolve(process.env.UNI_INPUT_DIR, id.substr(3));
				} else if (id.startsWith("@/")) {
					return path.resolve(process.env.UNI_INPUT_DIR, id.substr(2));
				} else if (id.startsWith("/") && !id.startsWith("//")) {
					return path.resolve(process.env.UNI_INPUT_DIR, id.substr(1));
				}
				return id;
			},
		}),
		require("autoprefixer")({
			remove: process.env.UNI_PLATFORM !== "h5",
		}),
		require("tailwindcss")({
			config: path.resolve(__dirname, "./tailwind.config.js"),
		}),
		WeappTailwindcssDisabled ? require('@dcloudio/vue-cli-plugin-uni/packages/postcss') : undefined
	],
};
