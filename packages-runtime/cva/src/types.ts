import type {
  ClassValue,
  ClsxFn,
} from '@weapp-tailwindcss/runtime'

export type ClassPropKey = 'class' | 'className'
export type ClassProp
  = | {
    class: ClassValue
    className?: never
  }
  | {
    class?: never
    className: ClassValue
  }
  | {
    class?: never
    className?: never
  }

export type OmitUndefined<T> = T extends undefined ? never : T
export type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T

export type VariantProps<Component extends (...args: any) => any>
  = Omit<OmitUndefined<Parameters<Component>[0]>, 'class' | 'className'>

export type CxOptions = Parameters<ClsxFn>
export type CxReturn = ReturnType<ClsxFn>

export type ConfigSchema = Record<string, Record<string, ClassValue>>
export type ConfigVariants<T extends ConfigSchema> = {
  [Variant in keyof T]?:
    | StringToBoolean<keyof T[Variant]>
    | null
    | undefined
}

export type ConfigVariantsMulti<T extends ConfigSchema> = {
  [Variant in keyof T]?:
    | StringToBoolean<keyof T[Variant]>
    | StringToBoolean<keyof T[Variant]>[]
    | undefined
}

export type Config<T> = T extends ConfigSchema
  ? {
      variants?: T
      defaultVariants?: ConfigVariants<T>
      compoundVariants?: (
        T extends ConfigSchema
          ? (ConfigVariants<T> | ConfigVariantsMulti<T>) & ClassProp
          : ClassProp
      )[]
    }
  : never

export type Props<T> = T extends ConfigSchema ? ConfigVariants<T> & ClassProp : ClassProp

export type { ClassValue } from '@weapp-tailwindcss/runtime'
