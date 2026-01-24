import type { UserDefinedOptionsGeneralPart } from './general'
import type { UserDefinedOptionsImportantPart } from './important'
import type { UserDefinedOptionsLifecyclePart } from './lifecycle'
import type { UserDefinedOptionsMatcherPart } from './matcher'

export type {
  UserDefinedOptionsGeneralPart,
  UserDefinedOptionsImportantPart,
  UserDefinedOptionsLifecyclePart,
  UserDefinedOptionsMatcherPart,
}

export interface UserDefinedOptions
  extends UserDefinedOptionsGeneralPart,
  UserDefinedOptionsImportantPart,
  UserDefinedOptionsLifecyclePart,
  UserDefinedOptionsMatcherPart {}
