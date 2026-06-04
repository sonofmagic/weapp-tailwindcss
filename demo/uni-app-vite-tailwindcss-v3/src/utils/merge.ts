import { mergeConfigs, validators, Config, extendTailwindMerge } from 'tailwind-merge'


export type TwExtendedShadowsMergeGroupIds =
  | "extendedShadows.offset-x"
  | "extendedShadows.offset-y"
  | "extendedShadows.blur"
  | "extendedShadows.spread"
  | "extendedShadows.opacity"
  | "extendedShadows.shadows"
  | "extendedShadows.shadows-scale"
  | "extendedShadows.shadows-ease";
// https://github.com/vltansky/tailwind-merge-rtl-plugin
// https://github.com/kaelansmith/tailwind-extended-shadows-merge
export function withMagic(config: Config<TwExtendedShadowsMergeGroupIds,string>): Config<TwExtendedShadowsMergeGroupIds,string> {
  return mergeConfigs(config, {
    extend: {
      classGroups: {
        'magic.my-group': [
          { magic: [validators.isLength, 'wow'] }
        ],
      },
    },
  })
}

export const twMerge = extendTailwindMerge(withMagic)