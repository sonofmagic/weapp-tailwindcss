import type {
  ICustomAttributes,
  ICustomAttributesEntities,
  ItemOrItemArray,
} from '@/types'
import { isMap } from '@/utils'

export function toCustomAttributesEntities(customAttributes: ICustomAttributes): ICustomAttributesEntities {
  if (isMap(customAttributes)) {
    return [
      ...(customAttributes as Exclude<ICustomAttributes, Record<string, ItemOrItemArray<string | RegExp>>>).entries(),
    ]
  }

  return Object.entries(customAttributes)
}
