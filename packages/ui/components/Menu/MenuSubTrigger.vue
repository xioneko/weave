<script lang="ts">
export interface MenuSubTriggerProps extends MenuItemProps {}
</script>

<script setup lang="ts">
import type { MenuItemProps } from "#components/Menu"
import { PopperAnchor } from "../Popper"
import { useForwardRef } from "../shared/useForwardRef"
import { delay, resetTimers } from "./MenuContent.vue"
import Item from "./MenuItem.vue"
import { MenuContext } from "./MenuRoot.vue"
import { MenuSubContext } from "./MenuSub.vue"
import { inject } from "vue"

const { disabled } = defineProps<MenuSubTriggerProps>()
defineOptions({
  inheritAttrs: false,
})

const { open } = inject(MenuContext)!
const { closeTimer, openTimer, triggerRef, isTriggeredByKeyboard } = inject(MenuSubContext)!

const [_, forwardRef] = useForwardRef(triggerRef)

const handleSelect = (event: Event) => {
  event.preventDefault()
  open.value = true
  isTriggeredByKeyboard.value = true
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "ArrowRight") {
    open.value = true
    isTriggeredByKeyboard.value = true
    event.preventDefault()
  }
}

const handleMouseEnter = (event: MouseEvent) => {
  if (disabled) return
  resetTimers(openTimer, closeTimer)
  delay(
    () => {
      open.value = true
      isTriggeredByKeyboard.value = false
    },
    openTimer,
    200,
  )
}

const handleMouseLeave = (event: MouseEvent) => {
  if (disabled) return
  const itemEl = event.currentTarget as HTMLElement
  const contentEl = (event.currentTarget as HTMLElement).closest("[data-menu-content]")
  if (contentEl) {
    const itemReact = itemEl.getBoundingClientRect()
    if (event.clientX <= itemReact.left || event.clientX >= itemReact.right) {
      const contentRect = contentEl.getBoundingClientRect()
      const contentSide = contentRect.right >= itemReact.right ? "right" : "left"
      const mouseSide = event.clientX >= itemReact.right ? "right" : "left"
      if (contentSide === mouseSide) return
    }
    resetTimers(openTimer, closeTimer)
    delay(() => (open.value = false), closeTimer, 200)
  }
}
</script>

<template>
  <PopperAnchor as-child>
    <Item
      :data-state="open ? 'open' : 'closed'"
      :data-active="(open && closeTimer === undefined) || undefined"
      :disabled="disabled"
      v-bind="$attrs"
      :ref="forwardRef"
      @select="handleSelect"
      @keydown="handleKeydown"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <slot />
    </Item>
  </PopperAnchor>
</template>
