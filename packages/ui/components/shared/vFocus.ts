import type { ObjectDirective } from "vue"

/**
 * @note value passed to the directive should be stable
 */
export const vFocus: ObjectDirective<HTMLElement, boolean, "prevent"> = {
  mounted(element, binding) {
    if (binding.value) {
      element.focus({
        preventScroll: binding.modifiers.prevent,
      })
    }
  },
}
