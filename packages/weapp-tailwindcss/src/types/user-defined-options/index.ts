import type { UserDefinedOptionsGeneralPart } from './general'
import type { UserDefinedOptionsImportantPart } from './important'
import type { UserDefinedOptionsLifecyclePart } from './lifecycle'
import type { UserDefinedOptionsMatcherPart } from './matcher'

export type {
  UserDefinedOptionsGeneralPart,
} from './general'

export type {
  UniAppXComponentLocalStylesOptions,
  UniAppXOptions,
} from './important'

export type {
  UserDefinedOptionsImportantPart,
} from './important'

export type {
  UserDefinedOptionsLifecyclePart,
} from './lifecycle'

export type {
  UserDefinedOptionsMatcherPart,
} from './matcher'

export interface UserDefinedOptions
  extends UserDefinedOptionsGeneralPart,
  UserDefinedOptionsImportantPart,
  UserDefinedOptionsLifecyclePart,
  UserDefinedOptionsMatcherPart {}
