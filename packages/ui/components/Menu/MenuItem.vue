<script lang="ts">
export interface MenuItemProps {
  disabled?: boolean
}

interface MenuItemEmits {
  /**
   * Calling `event.preventDefault` will prevent the menu from closing
   */
  select: [event: MouseEvent | KeyboardEvent]
}
</script>

<script setup lang="ts">
import el from "../shared/polymorphic"
import { useForwardRef } from "../shared/useForwardRef"
import { MenuContentContext, useMenuItemCollect } from "./MenuContent.vue"
import { MenuContext } from "./MenuRoot.vue"
import { computed, inject, ref, useId } from "vue"

const { disabled } = defineProps<MenuItemProps>()
const emit = defineEmits<MenuItemEmits>()

const { tabStopId } = inject(MenuContentContext)!
const { open } = inject(MenuContext)!

const itemId = useId()

const [itemRef, forwardRef] = useForwardRef()
const focused = ref(false)

const tabIndex = computed(() => (tabStopId.value === itemId ? 0 : -1))
const itemData = computed(() => ({ disabled }))

useMenuItemCollect(itemRef, itemData)

const handleMouseEnter = (event: MouseEvent) => {
  const item = event.currentTarget as HTMLElement
  if (disabled) {
    const contentEl = item.closest("[data-menu-content]") as HTMLElement
    contentEl?.focus({ preventScroll: true })
  } else {
    item.focus({ preventScroll: true })
  }
}

const handleMouseLeave = (event: MouseEvent) => {
  const item = event.currentTarget as HTMLElement
  const contentEl = item.closest("[data-menu-content]") as HTMLElement
  contentEl?.focus({ preventScroll: true })
}

const handleFocus = (event: FocusEvent) => {
  focused.value = true
  tabStopId.value = itemId
}

const handleBlur = (event: FocusEvent) => {
  focused.value = false
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Pressing Enter or Space to select the focused item
  if (event.key === "Enter" || event.key === " ") {
    if (!disabled) {
      emit("select", event)
      if (!event.defaultPrevented) {
        open.value = false
        event.preventDefault() // Prevent the page from scrolling
      }
    }
  }
}

const handlePointerUp = (event: PointerEvent) => {
  if (!disabled) {
    emit("select", event)
    if (!event.defaultPrevented) {
      open.value = false
      event.preventDefault()
    }
  }
}

const handleMouseDown = (event: MouseEvent) => {
  // Prevent the focus from moving to the item when clicking on a disabled item
  if (disabled) event.preventDefault()
}
</script>

<template>
  <el.div
    data-menu-item
    :data-highlighted="focused || undefined"
    :data-disabled="disabled || undefined"
    :tabindex="tabIndex"
    :ref="forwardRef"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeyDown"
    @pointerup="handlePointerUp"
    @mousedown="handleMouseDown"
  >
    <slot />
  </el.div>
</template>
