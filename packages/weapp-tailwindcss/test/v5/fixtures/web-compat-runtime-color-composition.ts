export interface CompositionCase {
  id: string
  variable: string
  effectProperty: 'backgroundImage' | 'boxShadow' | 'filter' | 'maskImage' | 'textShadow'
  baseClasses: string[]
  colorClasses: [red: string, teal: string, arbitrary: string]
}

function createMaskCases(kind: 'conic' | 'linear' | 'radial' | 't'): CompositionCase[] {
  const variableKind = kind === 't' ? 'top' : kind
  return (['from', 'to'] as const).map(stop => ({
    id: `mask-${kind}-${stop}`,
    variable: `--tw-mask-${variableKind}-${stop}-color`,
    effectProperty: 'maskImage',
    baseClasses: [],
    colorClasses: [
      `mask-${kind}-${stop}-red-500`,
      `mask-${kind}-${stop}-teal-600/20`,
      `mask-${kind}-${stop}-[#123456]`,
    ],
  }))
}

export const compositionCases: CompositionCase[] = [
  {
    id: 'shadow',
    variable: '--tw-shadow-color',
    effectProperty: 'boxShadow',
    baseClasses: ['shadow-lg'],
    colorClasses: ['shadow-red-500', 'shadow-teal-600/20', 'shadow-[#123456]'],
  },
  {
    id: 'inset-shadow',
    variable: '--tw-inset-shadow-color',
    effectProperty: 'boxShadow',
    baseClasses: ['inset-shadow-sm'],
    colorClasses: ['inset-shadow-red-500', 'inset-shadow-teal-600/20', 'inset-shadow-[#123456]'],
  },
  {
    id: 'text-shadow',
    variable: '--tw-text-shadow-color',
    effectProperty: 'textShadow',
    baseClasses: ['text-shadow-sm'],
    colorClasses: ['text-shadow-red-500', 'text-shadow-teal-600/20', 'text-shadow-[#123456]'],
  },
  {
    id: 'drop-shadow',
    variable: '--tw-drop-shadow-color',
    effectProperty: 'filter',
    baseClasses: ['drop-shadow-md'],
    colorClasses: ['drop-shadow-red-500', 'drop-shadow-teal-600/20', 'drop-shadow-[#123456]'],
  },
  {
    id: 'ring',
    variable: '--tw-ring-color',
    effectProperty: 'boxShadow',
    baseClasses: ['ring-2'],
    colorClasses: ['ring-red-500', 'ring-teal-600/20', 'ring-[#123456]'],
  },
  {
    id: 'inset-ring',
    variable: '--tw-inset-ring-color',
    effectProperty: 'boxShadow',
    baseClasses: ['inset-ring-2'],
    colorClasses: ['inset-ring-red-500', 'inset-ring-teal-600/20', 'inset-ring-[#123456]'],
  },
  {
    id: 'ring-offset',
    variable: '--tw-ring-offset-color',
    effectProperty: 'boxShadow',
    baseClasses: ['ring-2', 'ring-offset-2'],
    colorClasses: ['ring-offset-red-500', 'ring-offset-[rgba(0,148,136,0.2)]', 'ring-offset-[#123456]'],
  },
  {
    id: 'gradient-from',
    variable: '--tw-gradient-from',
    effectProperty: 'backgroundImage',
    baseClasses: ['bg-linear-to-r', 'to-transparent'],
    colorClasses: ['from-red-500', 'from-teal-600/20', 'from-[#123456]'],
  },
  {
    id: 'gradient-via',
    variable: '--tw-gradient-via',
    effectProperty: 'backgroundImage',
    baseClasses: ['bg-linear-to-r', 'from-black', 'to-white'],
    colorClasses: ['via-red-500', 'via-teal-600/20', 'via-[#123456]'],
  },
  {
    id: 'gradient-to',
    variable: '--tw-gradient-to',
    effectProperty: 'backgroundImage',
    baseClasses: ['bg-linear-to-r', 'from-transparent'],
    colorClasses: ['to-red-500', 'to-teal-600/20', 'to-[#123456]'],
  },
  ...createMaskCases('linear'),
  ...createMaskCases('radial'),
  ...createMaskCases('conic'),
  ...createMaskCases('t'),
]
