import semver from 'semver'
import packageManifest from '../packages/weapp-tailwindcss/package.json'
import { repositoryManifest } from '../scripts/ci/version-contract.mjs'

export const TEMPLATE_PACKAGE_MANAGER = repositoryManifest.packageManager

export function isTemplateVersionCompatible(range: unknown) {
  return typeof range === 'string' && semver.validRange(range) !== null && semver.satisfies(packageManifest.version, range)
}
