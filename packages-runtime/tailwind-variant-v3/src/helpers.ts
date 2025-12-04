export function hasSlotOverrides(slotProps?: Record<string, any>) {
  if (!slotProps) {
    return false
  }

  for (const key in slotProps) {
    if (slotProps[key] !== undefined) {
      return true
    }
  }

  return false
}

export function hasVariantOverrides(slotProps?: Record<string, any>) {
  if (!slotProps) {
    return false
  }

  for (const key in slotProps) {
    if ((key === 'class' || key === 'className') || slotProps[key] === undefined) {
      continue
    }

    return true
  }

  return false
}
