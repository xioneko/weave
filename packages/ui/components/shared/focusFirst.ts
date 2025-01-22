type FocusFirstOptions = {
  preventScroll?: boolean
  start?: number
}

export function focusFirst(
  candidates: { el: HTMLElement }[],
  { preventScroll, start = 0 }: FocusFirstOptions = {},
) {
  const size = candidates.length
  if (start >= size) return
  const prevActiveElement = document.activeElement
  const end = (start - 1 + size) % size
  for (let i = start; i !== end; i = (i + 1) % size) {
    const { el } = candidates[i]
    if (el === prevActiveElement) return
    el?.focus({ preventScroll })
    if (document.activeElement === el) return
  }
}
