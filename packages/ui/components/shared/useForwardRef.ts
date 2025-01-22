import { type Ref, type ComponentPublicInstance, ref } from 'vue'

/**
 * forward a Element ref to a component's root element
 */
export function useForwardRef(providedRef?: Ref<HTMLElement | null>) {
  const forwardedRef = providedRef ?? ref<HTMLElement | null>(null)
  const forwardRef = (component: ComponentPublicInstance | null) => {
    const el = component?.$el as Node | undefined
    if (!el || el.nodeType === Node.ELEMENT_NODE) {
      forwardedRef.value = (el ?? null) as HTMLElement | null
    } else {
      throw new Error(
        `Forward ref failed: target component may have multiple root nodes ${component}.`,
      )
    }
  }
  return [
    forwardedRef,
    forwardRef as (ref: Element | ComponentPublicInstance | null) => void,
  ] as const
}
