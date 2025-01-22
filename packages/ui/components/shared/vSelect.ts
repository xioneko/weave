import type { ObjectDirective } from "vue"

/**
 * @note value passed to the directive should be stable
 */
export const vSelect: ObjectDirective<HTMLInputElement | HTMLTextAreaElement, boolean> = {
  mounted(element, binding) {
    if (binding.value) {
      element.select()
    }
  },
}
