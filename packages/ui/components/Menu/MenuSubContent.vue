<script lang="ts">
export interface MenuSubContentProps extends Omit<PopperContentProps, "side" | "align"> {}
export interface MenuSubContentEmits {
  positioned: [element: HTMLElement]
}
</script>

<script setup lang="ts">
import type { PopperContentProps } from "../Popper"
import { PopperContent } from "../Popper"
import { vDismissable, type vDismissableValue } from "../shared/vDismissable"
import {
  delay,
  handleMenuContentKeydown,
  isTargetInSubContent,
  provideCollection,
  resetTimers,
} from "./MenuContent.vue"
import { MenuContext } from "./MenuRoot.vue"
import { MenuSubContext } from "./MenuSub.vue"
import { inject } from "vue"

const props = defineProps<MenuSubContentProps>()
const emit = defineEmits<MenuSubContentEmits>()

const { open, hierarchy } = inject(MenuContext)!
const { triggerRef, closeTimer, openTimer, isTriggeredByKeyboard } = inject(MenuSubContext)!

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "ArrowLeft") {
    open.value = false
    triggerRef.value?.focus()
    event.preventDefault()
  }
  handleMenuContentKeydown(event, getMenuItems)
}

const handleMouseEnter = () => {
  window.clearTimeout(closeTimer.value)
  closeTimer.value = undefined
}

const handleDismiss: vDismissableValue = {
  onEscapeKeyDown() {
    open.value = false
    triggerRef.value?.focus()
  },
  onPointerDownOutside(element, target) {
    if (isTargetInSubContent(hierarchy, target)) return
    open.value = false
  },
  onFocusOutside(element, target) {
    if (isTargetInSubContent(hierarchy, target)) return
    resetTimers(closeTimer, openTimer)
    delay(() => (open.value = false), closeTimer, 200)
  },
}

const handlePopperPositioned = (element: HTMLElement) => {
  if (isTriggeredByKeyboard.value) element.focus()
  emit("positioned", element)
}

const getMenuItems = provideCollection()
</script>

<template>
  <PopperContent
    v-if="open"
    :data-menu-content="hierarchy"
    tabindex="-1"
    align="start"
    side="right"
    v-bind="props"
    v-dismissable="handleDismiss"
    @positioned="handlePopperPositioned"
    @keydown="handleKeydown"
    @mouseenter="handleMouseEnter"
  >
    <slot />
  </PopperContent>
</template>
