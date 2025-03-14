import type { clsx } from 'clsx'
import type { ClassProp, ClassValue, OmitUndefined, StringToBoolean } from './types'

export type VariantProps<Component extends (...args: any) => any> = Omit<OmitUndefined<Parameters<Component>[0]>, 'class' | 'className'>
export type CxOptions = Parameters<typeof clsx>
export type CxReturn = ReturnType<typeof clsx>
export declare const cx: typeof clsx
export type ConfigSchema = Record<string, Record<string, ClassValue>>
export type ConfigVariants<T extends ConfigSchema> = {
  [Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | null | undefined;
}
export type ConfigVariantsMulti<T extends ConfigSchema> = {
  [Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | StringToBoolean<keyof T[Variant]>[] | undefined;
}
export type Config<T> = T extends ConfigSchema ? {
  variants?: T
  defaultVariants?: ConfigVariants<T>
  compoundVariants?: (T extends ConfigSchema ? (ConfigVariants<T> | ConfigVariantsMulti<T>) & ClassProp : ClassProp)[]
} : never
export type Props<T> = T extends ConfigSchema ? ConfigVariants<T> & ClassProp : ClassProp
export declare const cva: <T>(base?: ClassValue, config?: Config<T>) => (props?: Props<T>) => string
export type {
  ClassValue,
}
