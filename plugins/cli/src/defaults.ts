import type { Result } from 'postcss-load-config'
import type { BuildOptions } from './type'

const defaultJavascriptExtensions = ['js'] // , 'cjs', 'mjs']

const defaultTypescriptExtensions = ['ts'] // , 'cts', 'mts']

const defaultWxsExtensions = ['wxs']

export const defaultNodeModulesDirs = [
  '**/node_modules/**',
  '**/miniprogram_npm/**',
  '**/project.config.json/**',
  '**/project.private.config.json/**',
  '**/package.json/**',
  'postcss.config.js',
  'tailwind.config.js',
  'weapp-tw.config.js',
]

function noop(): undefined {}

export function getDefaultOptions(options?: Partial<BuildOptions>, postcssOptionsFromConfig?: Result | undefined): Partial<BuildOptions> {
  return {
    outDir: 'dist',
    weappTailwindcssOptions: {},
    clean: true,
    src: '',
    exclude: [...defaultNodeModulesDirs],
    include: ['**/*.{png,jpg,jpeg,gif,svg,webp}'],
    extensions: {
      javascript: [...defaultJavascriptExtensions, ...defaultTypescriptExtensions, ...defaultWxsExtensions],
      html: ['wxml'],
      css: ['wxss', 'less', 'sass', 'scss'],
      json: ['json'],
    },
    watchOptions: {
      cwd: options?.root,
      events: ['add', 'change', 'unlink', 'ready'],
    },
    postcssOptions: postcssOptionsFromConfig,
    gulpChain: noop,
  }
}
