import packageManifest from '../packages/weapp-tailwindcss/package.json'
import { repositoryManifest } from '../scripts/ci/version-contract.mjs'

export const TEMPLATE_PACKAGE_MANAGER = repositoryManifest.packageManager
export const TEMPLATE_WEAPP_TAILWINDCSS_RANGE = `^${packageManifest.version}`
