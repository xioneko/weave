<script lang="ts">
export interface MenuContentProps extends PopperContentProps {}

interface MenuContentEmits {
  positioned: [element: HTMLElement]
}

interface MenuContentContextValue {
  tabStopId: Ref<string | null>
}

export const MenuContentContext = Symbol(
  "MenuContentContext",
) as InjectionKey<MenuContentContextValue>

export type MenuItemData = {
  disabled?: boolean
}

export const {
  provideCollection,
  injectCollection,
  useCollect: useMenuItemCollect,
} = createCollection<MenuItemData>()

type FocusIntent = "first" | "last" | "prev" | "next"
const MapKeyToFocusIntent: Record<string, FocusIntent> = {
  ArrowUp: "prev",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last",
}

export const handleMenuContentKeydown = (
  event: KeyboardEvent,
  getItems: ItemsGetter<MenuItemData>,
) => {
  // 1. Prevent tabbing out of the Menu Content
  if (event.key === "Tab") return event.preventDefault()

  // 2. Keyboard navigation
  const focusIntent = MapKeyToFocusIntent[event.key]
  if (focusIntent) {
    event.preventDefault()
    const candidates = getItems({ ordered: true }).filter(item => !item.data.disabled)
    if (focusIntent === "last" || focusIntent === "prev") candidates.reverse()
    if (focusIntent === "prev" || focusIntent === "next") {
      const currentIndex = candidates.findIndex(item => item.el === event.target)
      focusFirst(candidates, {
        start: (currentIndex + 1) % candidates.length,
      })
    } else {
      focusFirst(candidates)
    }
  }
}

export const delay = (fn: () => void, timer: Ref<number | undefined>, delay: number) => {
  timer.value = window.setTimeout(() => {
    fn()
    timer.value = undefined
  }, delay)
}

export const resetTimers = (timer1: Ref<number | undefined>, timer2: Ref<number | undefined>) => {
  window.clearTimeout(timer1.value)
  window.clearTimeout(timer2.value)
  timer1.value = undefined
  timer2.value = undefined
}

export const isTargetInSubContent = (currentPath: string, target: Element) => {
  const targetContentEl = target.closest("[data-menu-content]") as HTMLElement | null
  return (
    targetContentEl && targetContentEl.getAttribute("data-menu-content")?.startsWith(currentPath)
  )
}
</script>

<script setup lang="ts">
import { PopperContent, type PopperContentProps } from "#components/Popper"
import { createCollection, type ItemsGetter } from "../shared/createCollection"
import { focusFirst } from "../shared/focusFirst"
import { vDismissable, type vDismissableValue } from "../shared/vDismissable"
import { vScrollLock } from "../shared/vScrollLock"
import { MenuContext, MenuRootContext } from "./MenuRoot.vue"
import { inject, provide, ref, type InjectionKey, type Ref } from "vue"
import FocusLock from "vue-focus-lock"

const popperProps = defineProps<MenuContentProps>()

defineOptions({
  inheritAttrs: false,
})

const { modal, triggerRef } = inject(MenuRootContext)!
const { open, hierarchy } = inject(MenuContext)!

const tabStopId = ref<string | null>(null)

const handleDismiss: vDismissableValue = {
  onEscapeKeyDown(element) {
    open.value = false
  },
  onPointerDownOutside(element, target) {
    if (
      (triggerRef.value && triggerRef.value.contains(target)) ||
      isTargetInSubContent(hierarchy, target)
    )
      return
    open.value = false
  },
  onFocusOutside(element, target) {
    if (
      (triggerRef.value && triggerRef.value.contains(target)) ||
      isTargetInSubContent(hierarchy, target)
    )
      return
    open.value = false
  },
  onBlur(element, relatedTarget) {
    if (
      (triggerRef.value && triggerRef.value.contains(relatedTarget)) ||
      (relatedTarget instanceof Element && isTargetInSubContent(hierarchy, relatedTarget))
    )
      return
    open.value = false
  },
}

provide(MenuContentContext, { tabStopId })
const getMenuItems = provideCollection()
</script>

<template>
  <FocusLock
    v-if="open"
    v-scroll-lock="modal ? 'body' : false"
    v-dismissable="handleDismiss"
    :disabled="!modal"
  >
    <PopperContent
      :data-menu-content="hierarchy"
      tabindex="-1"
      v-bind="{ ...$attrs, ...popperProps }"
      @keydown="handleMenuContentKeydown($event, getMenuItems)"
      @positioned="$emit('positioned', $event)"
    >
      <slot />
    </PopperContent>
  </FocusLock>
</template>
