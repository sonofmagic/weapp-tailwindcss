import type { TVConfig, TWMConfig } from './config'
import type { TVGeneratedScreens } from './generated'

export type { TVConfig, TWMConfig } from './config'
export type { TailwindMergeAdapter } from './config'

type ClassDictionary = Record<string, any>

export type ClassValue
  = | string
    | number
    | boolean
    | null
    | undefined
    | ClassDictionary
    | ClassValue[]

export type ClassProp<V = ClassValue>
  = | { class?: V, className?: never }
    | { class?: never, className?: V }

type TVBaseName = 'base'

type TVScreens = 'initial' | TVGeneratedScreens

type TVSlots = Record<string, ClassValue> | undefined

type EmptySlots = Record<never, ClassValue>

type DefinedSlots<S extends TVSlots> = S extends undefined ? EmptySlots : S

type EmptyVariants = Record<never, never>

type DefinedVariants<V> = V extends undefined ? EmptyVariants : V

/**
 * ----------------------------------------------------------------------
 * Utils
 * ----------------------------------------------------------------------
 */

export type OmitUndefined<T> = T extends undefined ? never : T

export type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T

export type CnOptions = ClassValue[]

export type CnReturn = string | undefined

export declare const cnBase: <T extends CnOptions>(...classes: T) => CnReturn

export declare const cn: <T extends CnOptions>(...classes: T) => (config?: TWMConfig) => CnReturn

// compare if the value is true or array of values
export type isTrueOrArray<T> = [T] extends [true | readonly unknown[]] ? true : false

export type WithInitialScreen<T extends Array<string>>
  = ['initial', ...T]

/**
 * ----------------------------------------------------------------------
 * TV Types
 * ----------------------------------------------------------------------
 */

type TVSlotsWithBase<S extends TVSlots, B extends ClassValue> = B extends undefined
  ? keyof DefinedSlots<S>
  : keyof DefinedSlots<S> | TVBaseName

type SlotsClassValue<S extends TVSlots, B extends ClassValue> = {
  [K in TVSlotsWithBase<S, B>]?: ClassValue;
}

type VariantEntry<S extends TVSlots, B extends ClassValue> = S extends undefined
  ? ClassValue
  : SlotsClassValue<S, B> | ClassValue

interface TVVariantsDefault<S extends TVSlots, B extends ClassValue> {
  [key: string]: {
    [key: string]: VariantEntry<S, B>
  }
}

export type TVVariants<
  S extends TVSlots | undefined,
  B extends ClassValue | undefined = undefined,
  EV extends TVVariants<ES> | undefined = undefined,
  ES extends TVSlots | undefined = undefined,
> = EV extends undefined
  ? TVVariantsDefault<S, B>
  : | {
    [K in keyof EV]: {
      [K2 in keyof EV[K]]: S extends TVSlots
        ? SlotsClassValue<S, B> | ClassValue
        : ClassValue;
    };
  }
  | TVVariantsDefault<S, B>

export type TVCompoundVariants<
  V extends TVVariants<S>,
  S extends TVSlots,
  B extends ClassValue,
  EV extends TVVariants<ES>,
  ES extends TVSlots,
> = Array<
  {
    [K in keyof V | keyof EV]?:
      | (K extends keyof V ? StringToBoolean<keyof V[K]> : never)
      | (K extends keyof EV ? StringToBoolean<keyof EV[K]> : never)
      | (K extends keyof V ? StringToBoolean<keyof V[K]>[] : never);
  } & ClassProp<SlotsClassValue<S, B> | ClassValue>
>

interface TVCompoundSlotBase<S extends TVSlots, B extends ClassValue> {
  slots: Array<TVSlotsWithBase<S, B>>
}

type TVCompoundSlotExtras<
  V extends TVVariants<S>,
  S extends TVSlots,
> = V extends undefined
  ? ClassProp
  : {
    [K in keyof V]?: StringToBoolean<keyof V[K]> | StringToBoolean<keyof V[K]>[];
  } & ClassProp

export type TVCompoundSlots<
  V extends TVVariants<S>,
  S extends TVSlots,
  B extends ClassValue,
> = Array<TVCompoundSlotBase<S, B> & TVCompoundSlotExtras<V, S>>

export type TVDefaultVariants<
  V extends TVVariants<S>,
  S extends TVSlots,
  EV extends TVVariants<ES>,
  ES extends TVSlots,
> = {
  [K in keyof V | keyof EV]?:
    | (K extends keyof V ? StringToBoolean<keyof V[K]> : never)
    | (K extends keyof EV ? StringToBoolean<keyof EV[K]> : never);
}

export type TVScreenPropsValue<
  V extends TVVariants<S>,
  S extends TVSlots,
  K extends keyof V,
  C extends TVConfig,
> = C['responsiveVariants'] extends string[]
  ? {
      [Screen in WithInitialScreen<C['responsiveVariants']>[number]]?: StringToBoolean<keyof V[K]>;
    }
  : {
      [Screen in TVScreens]?: StringToBoolean<keyof V[K]>;
    }

type TVPropsWithoutExtended<
  V extends TVVariants<S>,
  S extends TVSlots,
  C extends TVConfig<V, undefined>,
> = V extends undefined
  ? ClassProp<ClassValue>
  : {
    [K in keyof V]?: isTrueOrArray<C['responsiveVariants']> extends true
      ? StringToBoolean<keyof V[K]> | TVScreenPropsValue<V, S, K, C> | undefined
      : StringToBoolean<keyof V[K]> | undefined;
  } & ClassProp<ClassValue>

type TVPropsExtendedWithoutVariants<
  C extends TVConfig<undefined, EV>,
  EV extends TVVariants<ES>,
  ES extends TVSlots,
> = {
  [K in keyof EV]?: isTrueOrArray<C['responsiveVariants']> extends true
    ? StringToBoolean<keyof EV[K]> | TVScreenPropsValue<EV, ES, K, C> | undefined
    : StringToBoolean<keyof EV[K]> | undefined;
} & ClassProp<ClassValue>

type TVPropsExtendedWithVariants<
  V extends TVVariants<S>,
  S extends TVSlots,
  C extends TVConfig<V, EV>,
  EV extends TVVariants<ES>,
  ES extends TVSlots,
> = {
  [K in keyof V | keyof EV]?: isTrueOrArray<C['responsiveVariants']> extends true
    ? | (K extends keyof V ? StringToBoolean<keyof V[K]> : never)
    | (K extends keyof EV ? StringToBoolean<keyof EV[K]> : never)
    | TVScreenPropsValue<EV & V, S, K, C>
    | undefined
    : | (K extends keyof V ? StringToBoolean<keyof V[K]> : never)
      | (K extends keyof EV ? StringToBoolean<keyof EV[K]> : never)
      | undefined;
} & ClassProp<ClassValue>

type TVPropsWithExtended<
  V extends TVVariants<S>,
  S extends TVSlots,
  C extends TVConfig<V, EV>,
  EV extends TVVariants<ES>,
  ES extends TVSlots,
> = V extends undefined
  ? TVPropsExtendedWithoutVariants<C, EV, ES>
  : TVPropsExtendedWithVariants<V, S, C, EV, ES>

export type TVProps<
  V extends TVVariants<S>,
  S extends TVSlots,
  C extends TVConfig<V, EV>,
  EV extends TVVariants<ES>,
  ES extends TVSlots,
> = EV extends undefined
  ? TVPropsWithoutExtended<V, S, C>
  : TVPropsWithExtended<V, S, C, EV, ES>

export type TVVariantKeys<V extends TVVariants<S>, S extends TVSlots> = V extends object
  ? Array<keyof V>
  : undefined

export interface TVReturnProps<
  V extends TVVariants<S>,
  S extends TVSlots,
  B extends ClassValue,
  EV extends TVVariants<ES>,
  ES extends TVSlots,
  // @ts-expect-error
  E extends TVReturnType = undefined,
> {
  extend: E
  base: B
  slots: S
  variants: V
  defaultVariants: TVDefaultVariants<V, S, EV, ES>
  compoundVariants: TVCompoundVariants<V, S, B, EV, ES>
  compoundSlots: TVCompoundSlots<V, S, B>
  variantKeys: TVVariantKeys<V, S>
}

type HasSlots<S extends TVSlots, ES extends TVSlots> = S extends undefined
  ? ES extends undefined
    ? false
    : true
  : true

type TVRenderResultWithSlots<
  V extends TVVariants<S>,
  S extends TVSlots,
  B extends ClassValue,
  C extends TVConfig<V, EV>,
  EV extends TVVariants<ES>,
  ES extends TVSlots,
> = {
  [K in keyof DefinedSlots<ES>]: (
    slotProps?: TVProps<V, S, C, EV, ES>,
  ) => string;
} & {
  [K in keyof DefinedSlots<S>]: (
    slotProps?: TVProps<V, S, C, EV, ES>,
  ) => string;
} & {
  [K in TVSlotsWithBase<EmptySlots, B>]: (
    slotProps?: TVProps<V, S, C, EV, ES>,
  ) => string;
}

type TVRenderResult<
  V extends TVVariants<S>,
  S extends TVSlots,
  B extends ClassValue,
  C extends TVConfig<V, EV>,
  EV extends TVVariants<ES>,
  ES extends TVSlots,
> = HasSlots<S, ES> extends true
  ? TVRenderResultWithSlots<V, S, B, C, EV, ES>
  : string

export type TVReturnType<
  V extends TVVariants<S>,
  S extends TVSlots,
  B extends ClassValue,
  C extends TVConfig<V, EV>,
  EV extends TVVariants<ES>,
  ES extends TVSlots,
  // @ts-expect-error
  E extends TVReturnType = undefined,
> = {
  (props?: TVProps<V, S, C, EV, ES>): TVRenderResult<V, S, B, C, EV, ES>
} & TVReturnProps<V, S, B, EV, ES, E>

export interface TV {
  <
    V extends TVVariants<S, B, EV>,
    CV extends TVCompoundVariants<V, S, B, EV, ES>,
    DV extends TVDefaultVariants<V, S, EV, ES>,
    C extends TVConfig<V, EV>,
    B extends ClassValue = undefined,
    S extends TVSlots = undefined,
    // @ts-expect-error
    E extends TVReturnType = TVReturnType<
      V,
      S,
      B,
      C,
      // @ts-expect-error
      DefinedVariants<EV>,
      // @ts-expect-error
      DefinedSlots<ES>
    >,
    EV extends TVVariants<ES, B, E['variants'], ES> = E['variants'],
    ES extends TVSlots = E['slots'] extends TVSlots ? E['slots'] : undefined,
  >(
    options: {
      /**
       * Extend allows for easy composition of components.
       * @see https://www.tailwind-variants.org/docs/composing-components
       */
      extend?: E
      /**
       * Base allows you to set a base class for a component.
       */
      base?: B
      /**
       * Slots allow you to separate a component into multiple parts.
       * @see https://www.tailwind-variants.org/docs/slots
       */
      slots?: S
      /**
       * Variants allow you to create multiple versions of the same component.
       * @see https://www.tailwind-variants.org/docs/variants#adding-variants
       */
      variants?: V
      /**
       * Compound variants allow you to apply classes to multiple variants at once.
       * @see https://www.tailwind-variants.org/docs/variants#compound-variants
       */
      compoundVariants?: CV
      /**
       * Compound slots allow you to apply classes to multiple slots at once.
       */
      compoundSlots?: TVCompoundSlots<V, S, B>
      /**
       * Default variants allow you to set default variants for a component.
       * @see https://www.tailwind-variants.org/docs/variants#default-variants
       */
      defaultVariants?: DV
    },
    /**
     * The config object allows you to modify the default configuration.
     * @see https://www.tailwind-variants.org/docs/api-reference#config-optional
     */
    config?: C,
  ): TVReturnType<V, S, B, C, EV, ES, E>
}

export interface CreateTV<RV extends TVConfig['responsiveVariants'] = undefined> {
  <
    V extends TVVariants<S, B, EV>,
    CV extends TVCompoundVariants<V, S, B, EV, ES>,
    DV extends TVDefaultVariants<V, S, EV, ES>,
    C extends TVConfig<V, EV>,
    B extends ClassValue = undefined,
    S extends TVSlots = undefined,
    // @ts-expect-error
    E extends TVReturnType = TVReturnType<
      V,
      S,
      B,
      C,
      // @ts-expect-error
      DefinedVariants<EV>,
      // @ts-expect-error
      DefinedSlots<ES>
    >,
    EV extends TVVariants<ES, B, E['variants'], ES> = E['variants'],
    ES extends TVSlots = E['slots'] extends TVSlots ? E['slots'] : undefined,
  >(
    options: {
      /**
       * Extend allows for easy composition of components.
       * @see https://www.tailwind-variants.org/docs/composing-components
       */
      extend?: E
      /**
       * Base allows you to set a base class for a component.
       */
      base?: B
      /**
       * Slots allow you to separate a component into multiple parts.
       * @see https://www.tailwind-variants.org/docs/slots
       */
      slots?: S
      /**
       * Variants allow you to create multiple versions of the same component.
       * @see https://www.tailwind-variants.org/docs/variants#adding-variants
       */
      variants?: V
      /**
       * Compound variants allow you to apply classes to multiple variants at once.
       * @see https://www.tailwind-variants.org/docs/variants#compound-variants
       */
      compoundVariants?: CV
      /**
       * Compound slots allow you to apply classes to multiple slots at once.
       */
      compoundSlots?: TVCompoundSlots<V, S, B>
      /**
       * Default variants allow you to set default variants for a component.
       * @see https://www.tailwind-variants.org/docs/variants#default-variants
       */
      defaultVariants?: DV
    },
    /**
     * The config object allows you to modify the default configuration.
     * @see https://www.tailwind-variants.org/docs/api-reference#config-optional
     */
    config?: C,
  ): TVReturnType<V, S, B, C & RV, EV, ES, E>
}

export type CreateTVFactory = <
  RV extends TVConfig['responsiveVariants'] = undefined,
>(
  config: TVConfig & { responsiveVariants?: RV },
) => CreateTV<RV>

// main function
export declare const tv: TV

export declare function createTV<T extends TVConfig['responsiveVariants']>(
  config: TVConfig & { responsiveVariants?: T },
): CreateTV<T>

export declare const defaultConfig: TVConfig

export type VariantProps<Component extends (...args: any) => any> = Omit<
  OmitUndefined<Parameters<Component>[0]>,
  'class' | 'className'
>
