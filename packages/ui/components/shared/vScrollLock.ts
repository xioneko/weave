import type { ObjectDirective } from "vue"

/**
 * @note This directive should be used with a stable value
 */
export const vScrollLock: ObjectDirective<
  HTMLElement,
  string | false | HTMLElement | null | undefined | (() => HTMLElement | null | undefined)
> = {
  mounted(el, binding) {
    if (binding.value) {
      const target =
        typeof binding.value === "string"
          ? (document.querySelector(binding.value) as HTMLElement | null)
          : typeof binding.value === "function"
            ? binding.value()
            : binding.value

      if (target) {
        const original = target.style.overflow
        target.style.overflow = "hidden"
        // @ts-expect-error
        el["__vScrollLock"] = { cleanup: () => (target.style.overflow = original) }
      }
    }
  },
  unmounted(el) {
    // @ts-expect-error
    el["__vScrollLock"]?.cleanup()
  },
}
